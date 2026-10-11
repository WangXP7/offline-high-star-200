# Slay the web API design

## Core architecture (current)

- State-based: Actions are pure functions `(state, props) => newState`
- Queue system: Actions enqueued and processed sequentially
- Turn-based: Perfect for command pattern with clear state transitions

```js
// Core pattern
game.enqueue({type: 'playCard', card})
game.dequeue()

// Queue enables
// - Undo/redo
// - Action history
// - Save states
// - Debugging
```

## API style options

All styles would wrap the same core engine:

1. Current (Raw Actions) - Explicit and debuggable but verbose
   ```js
   game.enqueue({type: 'playCard', card: strike})
   game.dequeue()
   ```

2. Fluent/Chainable - Readable sequences
   ```js
   game.drawCards(5).playCard(strike, 'enemy0').endTurn()
   ```

3. Command Strings - Console-like for debugging
   ```js
   game.do('/play strike enemy0')
   ```

4. Domain-Specific - Organized by game concepts
   ```js
   game.combat.play(strike).on('enemy0')
   game.deck.draw(5)
   ```

5. Builder Pattern - Step-by-step construction
   ```js
   game.command.play(strike).target('enemy0').run()
   ```

## Implementation considerations

1. All wrappers map to core state transforms
2. Actions remain composable
3. Type safety for parameters

## Conclusion

The state-based core architecture is powerful, flexible, and should be preserved. Thin wrapper APIs can provide more ergonomic interfaces for common operations while maintaining the underlying strengths of the system.

---

# Experiment: Animating Game Actions

## The Problem

Slay the Web has two layers that need to work together:

1. **Game logic** (`src/game/actions.js`) - Pure, synchronous functions that transform state
2. **UI** (`src/ui/components/game-screen.js`) - Renders state and handles animations with GSAP

When you play a card, the action runs immediately and returns new state. The UI then re-renders. This works fine for simple cards, but breaks down for cards with complex effects.

### Example: Red Horse

Red Horse discards 2 random cards and adds 3 Shivs to your hand. The card defines these as `actions`:

```js
actions: [
  {type: 'discardRandomCards', parameter: {amount: 2}},
  {type: 'addCardsToHand', parameter: {cardName: 'Shiv', amount: 3}},
]
```

When played:
1. `playCard` action runs
2. `useCardActions` loops through and executes both actions
3. State is updated - 2 cards gone, 3 Shivs added
4. UI re-renders with new hand

The problem: **cards just vanish and appear**. There's no opportunity to animate because by the time the UI renders, the state has already changed.

### Current Animation Patterns

The codebase has two patterns that work around this:

**1. Animate-then-state** (used by `endTurn`)
```js
gsap.effects.discardHand('.Hand .Card', {
  onComplete: () => {
    this.game.enqueue({type: 'endTurn'})
    this.update()
  }
})
```
Animate existing DOM elements, then update state when animation completes.

**2. Clone-and-animate** (used by `playCard`)
```js
const clone = cardEl.cloneNode(true)
this.update()  // state changes, real card disappears
gsap.effects.playCard(clone)  // animate the clone
```
Clone the element before state change, update state, animate the clone.

Both patterns work because the UI controls when the action runs. But for card actions (like Red Horse's effects), the actions run deep inside `useCardActions()` where the UI can't intercept.

---

## Design Options Considered

### 1. State Diffing
Snapshot hand before action, diff after, animate the changes.

```js
const before = state.hand.map(c => c.id)
state = playCard(state, {...})
const after = state.hand.map(c => c.id)
const removed = before.filter(id => !after.includes(id))
const added = after.filter(id => !before.includes(id))
```

**Pros**: Actions stay pure, minimal refactor  
**Cons**: Can't distinguish *why* cards moved (discarded vs exhausted vs transformed)

### 2. GSAP Flip
Capture layout state before action, run action, let Flip animate DOM changes.

```js
const flip = Flip.getState('.Hand .Card')
state = playCard(state, {...})
render(state)
Flip.from(flip, {duration: 0.3})
```

**Pros**: Already in codebase, handles repositioning  
**Cons**: Only works for elements that stay in DOM - removed elements vanish, new elements pop in

### 3. Clone Pattern
Before running action, clone elements that will be removed, animate clones after state updates.

**Pros**: Decoupled from action system  
**Cons**: Need to predict which elements will be affected

### 4. Two-Phase Commit
Split actions into "preview" and "commit" phases.

```js
const preview = previewAction(state, action)  // {removed: [...], added: [...]}
await animateOut(preview.removed)
state = commitAction(preview)
await animateIn(preview.added)
```

**Pros**: Full control over timing  
**Cons**: Every action needs two implementations

---

## Proposed Solution: Effect Sequences

The cleanest architecture separates "what happens" from "how it looks":

### Core Idea

Actions don't mutate state directly. Instead, they return an array of **effect objects** describing what should happen:

```js
// Before: action returns new state
function discardRandomCards(state, {amount}) {
  return produce(state, draft => {
    const cards = pickRandom(draft.hand, amount)
    draft.hand = draft.hand.filter(c => !cards.includes(c))
    draft.discardPile.push(...cards)
  })
}

// After: action returns effects
function discardRandomCards(state, {amount}) {
  const cards = pickRandom(state.hand, amount)
  return [
    {type: 'discard', cards}
  ]
}
```

### The Coordinator

A coordinator async-loops through effects, awaiting UI animation for each, then committing the state change:

```js
async function runEffects(state, effects) {
  for (const effect of effects) {
    // 1. UI animates (optional, may be no-op)
    await ui.animate(effect)
    
    // 2. State updates
    state = applyEffect(state, effect)
    
    // 3. UI re-renders
    render(state)
  }
  return state
}
```

### UI Handlers

The UI registers handlers per effect type. Each handler knows how to animate that effect:

```js
ui.register('discard', async (effect, state) => {
  const elements = effect.cards.map(c => 
    document.querySelector(`[data-id="${c.id}"]`)
  )
  await gsap.effects.discardCards(elements)
})

ui.register('addToHand', async (effect, state) => {
  // For additions, we animate AFTER state commit
  // Handler is called post-render with new elements
})
```

### Effect Timing

Effects need to declare when animation happens relative to state commit:

```js
{type: 'discard', cards: [...], timing: 'before'}
// Animate existing elements, then remove from state

{type: 'addToHand', cards: [...], timing: 'after'}  
// Add to state, render, then animate new elements
```

Or the coordinator infers timing from effect type:
- Removal effects: animate before commit (elements exist)
- Addition effects: commit before animate (elements need to exist)

### Complex Card Example

Red Horse would produce this effect sequence:

```js
function playRedHorse(state) {
  const toDiscard = pickRandom(state.hand, 2)
  return [
    {type: 'discard', cards: toDiscard},
    {type: 'addToHand', cardName: 'Shiv', amount: 3},
  ]
}
```

The coordinator processes sequentially:
1. Animate 2 cards flying to discard pile
2. Commit: remove cards from hand, add to discard pile
3. Commit: create 3 Shivs, add to hand
4. Animate 3 Shivs dealing in

### Nested Effects

Some cards trigger other effects. The coordinator handles this naturally:

```js
{type: 'damage', target: 'enemy0', amount: 10}
// If enemy dies, applyEffect returns additional effects:
// [{type: 'enemyDeath', enemy: ...}, {type: 'goldGain', amount: 25}]
```

---

## Benefits

1. **Game logic stays pure** - Actions just describe intent, no DOM/animation awareness
2. **Animations are declarative** - Register a handler once, works everywhere
3. **Testable** - Can run effects without UI, just apply state changes
4. **Extensible** - New effect types just need a handler
5. **Replayable** - Effect log can recreate game state AND animations

## Tradeoffs

1. **Refactor required** - All actions need to return effects instead of state
2. **Async complexity** - Game flow becomes async, need to handle interruptions
3. **Two systems** - Effects AND state mutations (applyEffect still mutates)

## Migration Path

1. Keep existing action system working
2. Add effect support to action manager as opt-in
3. Migrate actions one by one, starting with animated ones
4. Eventually all actions return effects

---

## Open Questions

- How to handle effects that depend on previous effect results?
- Should `applyEffect` be auto-generated from effect type, or hand-written?
- How to handle player choices mid-sequence? (e.g., "choose a card to discard")
- What happens if animation is skipped/fast-forwarded?
- How does undo/redo work with effect sequences?

---

## Next Steps

1. Prototype the coordinator with a single effect type (discard)
2. Test with Red Horse card
3. Evaluate complexity vs. benefit
4. Decide whether to commit to full migration or use simpler approach (state diffing) for now
