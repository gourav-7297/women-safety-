import { useState } from "react";
import { Search, Shield, Moon, Car, Globe, Heart, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

interface SafetyTipsViewProps {
    onBack: () => void;
}

export const SafetyTipsView = ({ onBack }: SafetyTipsViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        {
            id: "night",
            title: "Night Safety",
            icon: Moon,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            tips: [
                "Stick to well-lit, busy streets. Avoid shortcuts through parks or vacant lots.",
                "Walk with confidence. Keep your head up and stay aware of your surroundings.",
                "Keep your phone charged and easily accessible.",
                "Share your live location with a trusted contact before leaving.",
                "Trust your instincts. If a situation feels wrong, leave immediately.",
            ],
        },
        {
            id: "travel",
            title: "Public Transport & Cabs",
            icon: Car,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            tips: [
                "Verify the driver's name, car model, and license plate before entering.",
                "Sit in the back seat directly behind the driver.",
                "Share your ride details with a friend or family member.",
                "Stay awake and alert during the ride. Avoid using headphones.",
                "Have your keys ready when approaching your destination.",
            ],
        },
        {
            id: "online",
            title: "Online Safety",
            icon: Globe,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            tips: [
                "Be cautious about sharing personal information on social media.",
                "Use strong, unique passwords and enable two-factor authentication.",
                "Don't accept friend requests from strangers.",
                "Be wary of phishing links and suspicious emails.",
                "Block and report anyone who harasses you online.",
            ],
        },
        {
            id: "defense",
            title: "Self Defense Basics",
            icon: Shield,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            tips: [
                "Aim for vulnerable areas: eyes, nose, throat, and groin.",
                "Use your voice. Scream 'FIRE' or 'NO' loudly to attract attention.",
                "Use everyday objects as weapons (keys, umbrella, bag).",
                "Escape is the goal. Run away as soon as you have an opening.",
                "Stomp on the attacker's foot with your heel.",
            ],
        },
        {
            id: "domestic",
            title: "Domestic Safety",
            icon: Heart,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            tips: [
                "Create a safety plan. Know where you can go if you need to leave quickly.",
                "Keep an emergency bag packed with essentials (documents, money, keys).",
                "Memorize important phone numbers in case your phone is taken.",
                "Use a code word with trusted friends to signal you need help.",
                "Call the National Domestic Violence Hotline for support.",
            ],
        },
        {
            id: "emergency",
            title: "Emergency Situations",
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            tips: [
                "Call emergency services (112 or 911) immediately.",
                "Stay on the line with the operator until help arrives.",
                "If you can't speak, tap the phone or cough to signal you're there.",
                "Try to stay calm and provide clear details about your location.",
                "Administer basic first aid if safe to do so.",
            ],
        },
    ];

    const filteredCategories = categories.filter((cat) =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.tips.some((tip) => tip.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#faf9f9] dark:bg-background flex flex-col relative overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-10 glass-panel border-b border-border/40 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="rounded-full hover:bg-primary/10 px-2">
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                        <span className="font-semibold px-1">Back</span>
                    </Button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Safety Tips
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto z-10 scrollbar-hide pb-24">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search safety tips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-2xl bg-white dark:bg-card border-none shadow-sm focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {filteredCategories.map((category) => (
                            <AccordionItem key={category.id} value={category.id} className="border-none">
                                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-black/5 dark:hover:bg-white/5 data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/5">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`p-3 rounded-xl ${category.bg} ${category.color}`}>
                                                <category.icon className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-foreground text-lg">{category.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2 bg-white/50 dark:bg-card/50">
                                        <ul className="space-y-3 mt-2">
                                            {category.tips.map((tip, index) => (
                                                <li key={index} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                    <span className={`${category.color} font-bold`}>•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No safety tips found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
