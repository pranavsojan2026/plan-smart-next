import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function AIChatPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
      <Card className="p-6">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto">
            <div className="text-center py-8">
              <p className="text-muted-foreground">How can I help you today?</p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 rounded-md border p-2"
              />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 