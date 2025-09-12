import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Plus, ShoppingCart, Home, Settings, User, FileText, Users, BarChart3, MessageSquare } from "lucide-react";

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
      case "student-dashboard":
        navigate("/dashboard/student");
        break;
      case "buyer-dashboard":
        navigate("/dashboard/buyer");
        break;
      case "admin-dashboard":
        navigate("/admin");
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
      ]
    },
    {
      group: "Marketplace",
      items: [
        { id: "search-services", label: "Search Services", icon: Search, shortcut: "⌘S" },
      ]
    },
    {
      group: "Demo Dashboards",
      items: [
        { id: "student-dashboard", label: "Student Dashboard", icon: User, shortcut: "⌘1" },
        { id: "buyer-dashboard", label: "Buyer Dashboard", icon: ShoppingCart, shortcut: "⌘2" },
        { id: "admin-dashboard", label: "Admin Dashboard", icon: BarChart3, shortcut: "⌘3" },
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
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredCommands.map((group, groupIndex) => (
              <div key={group.group}>
                <CommandGroup heading={group.group}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleCommand(item.id)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <Badge variant="outline" className="text-xs">
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