import commandRegistry from "../commands";
import type { CommandContext } from "../commands/base/Command";
import type { FileSystem } from "./FileSystem";
import type { GitRepository } from "./GitRepository";
import type { ProgressManager } from "./ProgressManager";

export class CommandProcessor {
    constructor(
        private fileSystem: FileSystem,
        private gitRepository: GitRepository,
        private progressManager: ProgressManager,
        private currentDirectory = "/",
    ) {}

    // Process a command and return the output
    public processCommand(command: string): string[] {
        // Check if the command is empty
        if (!command.trim()) return [];

        // Create CommandContext with necessary references
        const context: CommandContext = {
            fileSystem: this.fileSystem,
            gitRepository: this.gitRepository,
            currentDirectory: this.currentDirectory,
            setCurrentDirectory: (dir: string) => {
                // Validate directory exists and is actually a directory
                const dirContents = this.fileSystem.getDirectoryContents(dir);
                if (dirContents !== null) {
                    this.currentDirectory = dir;
                } else {
                    // Silently fail for now (matches git behavior when cd fails in a non-interactive context)
                    console.warn(`Directory not found: ${dir}`);
                }
            },
            progressManager: this.progressManager,
        };

        // Delegate command execution to the registry
        return commandRegistry.execute(command, context);
    }

    // Get current directory (needed for UI display)
    public getCurrentDirectory(): string {
        return this.currentDirectory;
    }

    // Set current directory with validation
    public setCurrentDirectory(dir: string): boolean {
        const dirContents = this.fileSystem.getDirectoryContents(dir);
        if (dirContents !== null) {
            this.currentDirectory = dir;
            return true;
        }
        return false;
    }

    // Helper method for Terminal tab completion
    public getCurrentDirectoryFiles(): string[] {
        const contents = this.fileSystem.getDirectoryContents(this.currentDirectory);
        return contents ? Object.keys(contents) : [];
    }
}
