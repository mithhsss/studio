import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import AICareerNavigator from '@/components/ai-career-navigator';
import { AppLogo, OrangeIcon, BlueIcon, YellowIcon, GreenIcon } from '@/components/icons';
import { BookOpen, Code, GraduationCap, Map, Settings, PlusCircle, Star, GitPullRequestArrow, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">AI Career Navigator</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">AI Tools</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <OrangeIcon />
                <div>
                  <p className="font-semibold">AI Tutor</p>
                  <p className="text-xs text-muted-foreground">Personalized learning</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BlueIcon />
                <div>
                  <p className="font-semibold">AI Roadmap</p>
                  <p className="text-xs text-muted-foreground">Career guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <YellowIcon />
                <div>
                  <p className="font-semibold">AI Mentor</p>
                  <p className="text-xs text-muted-foreground">Professional advice</p>
                </div>
              </div>
               <div className="flex items-center gap-3">
                <GreenIcon />
                <div>
                  <p className="font-semibold">AI Coder</p>
                  <p className="text-xs text-muted-foreground">Coding assistance</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">AI Usage Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Tutor Sessions</span>
                  <span className="font-bold text-red-500">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Roadmap Updates</span>
                  <span className="font-bold text-blue-500">12</span>
                </div>
                 <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">XP from All Tools</span>
                    <span className="font-bold text-yellow-500">236</span>
                  </div>
                  <Progress value={23.6} className="h-2 bg-yellow-100 [&>div]:bg-yellow-400" />
                </div>
              </div>
          </div>
           <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">AI Badges Earned</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700">AI Novice</Badge>
                <Badge className="bg-blue-100 text-blue-700">Learner</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="profile picture" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">Alex Turner</span>
                        <span className="text-xs text-muted-foreground">alext@email.com</span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="end">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <AICareerNavigator />
      </main>
    </SidebarProvider>
  );
}
