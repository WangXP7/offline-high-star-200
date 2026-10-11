import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const Sidebar = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <nav
    className={cn(
      "hidden lg:flex p-2 h-screen fixed w-44 border-r border-primary/25 bg-background",
      className,
    )}
    {...props}
  />
);

const SidebarBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col h-full w-full", className)} {...props} />
);

const SidebarDrawer = DialogPrimitive.Root;
const SidebarDrawerTrigger = DialogPrimitive.Trigger;
const SidebarDrawerClose = DialogPrimitive.Close;
const SidebarDrawerPortal = DialogPrimitive.Portal;

const SidebarDrawerOverlay = () => (
  <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
);

const SidebarDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SidebarDrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-xs flex-col border-r border-primary/25 bg-background p-4 shadow-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SidebarDrawerContent.displayName = DialogPrimitive.Content.displayName;

const SidebarDrawerCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      "rounded-md p-2 text-inherit transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
SidebarDrawerCloseButton.displayName = DialogPrimitive.Close.displayName;

export {
  Sidebar,
  SidebarBody,
  SidebarDrawer,
  SidebarDrawerTrigger,
  SidebarDrawerPortal,
  SidebarDrawerOverlay,
  SidebarDrawerContent,
  SidebarDrawerClose,
  SidebarDrawerCloseButton,
};
