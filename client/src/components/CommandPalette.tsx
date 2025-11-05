import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Plus, Home, FileText, Users, MessageSquare, X } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleCommand = (command: string) => {
    onOpenChange(false);
    setSearch("");
    
    switch (command) {
      case "create-service":
        navigate("/dashboard/student/services/new");
        break;
      case "view-orders":
        navigate("/dashboard/buyer");
        break;
      case "search-services":
        navigate("/marketplace");
        break;
      case "home":
        navigate("/");
        break;
      case "about":
        navigate("/about");
        break;
      case "how-it-works":
        navigate("/how-it-works");
        break;
      case "contact":
        navigate("/contact");
        break;
      default:
        break;
    }
  };

  const commands = [
    {
      group: "Navigation",
      items: [
        { id: "home", label: "Home", icon: Home, shortcut: "⌘H" },
        { id: "about", label: "About", icon: Users, shortcut: "⌘A" },
        { id: "how-it-works", label: "How it Works", icon: FileText, shortcut: "⌘W" },
        { id: "contact", label: "Contact", icon: MessageSquare, shortcut: "⌘C" },
      ]
    },
    {
      group: "Marketplace",
      items: [
        { id: "search-services", label: "Search Services", icon: Search, shortcut: "⌘S" },
      ]
    },
    {
      group: "Actions",
      items: [
        { id: "create-service", label: "Create Service", icon: Plus, shortcut: "⌘N" },
      ]
    }
  ];

  const filteredCommands = commands.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <Command className="rounded-lg border shadow-xl">
          {/* Redesigned Search Bar */}
          <div className="relative border-b border-border/50 bg-white/95 dark:bg-white/95">
            <div className="flex items-center px-4 py-3">
              <Search className="h-5 w-5 text-gray-500 dark:text-gray-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-black dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-500 text-sm font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onOpenChange(false);
                  }
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="ml-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                  type="button"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found.</p>
            </CommandEmpty>
            {filteredCommands.map((group, groupIndex) => (
              <div key={group.group}>
                <CommandGroup heading={group.group}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleCommand(item.id)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.shortcut && (
                        <Badge variant="outline" className="text-xs font-mono px-2 py-0.5 border-border/50">
                          {item.shortcut}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {groupIndex < filteredCommands.length - 1 && <CommandSeparator />}
              </div>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}