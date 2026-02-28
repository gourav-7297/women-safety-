import { useState, useRef, useEffect } from "react";
import { Mic, Square, Video, VideoOff, Save, Trash2, ChevronLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EvidenceRecorderProps {
    onBack: () => void;
}

interface Recording {
    id: string;
    type: 'audio' | 'video';
    url: string;
    timestamp: Date;
    duration: number;
}

export const EvidenceRecorder = ({ onBack }: EvidenceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState<'audio' | 'video'>('audio');
    const [duration, setDuration] = useState(0);
    const [recordings, setRecordings] = useState<Recording[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        fetchRecordings();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopMediaStream();
        };
    }, []);

    const fetchRecordings = async () => {
        try {
            const { data, error } = await supabase
                .from('evidence')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedRecordings: Recording[] = data.map(record => ({
                    id: record.id,
                    type: record.type,
                    url: record.public_url,
                    timestamp: new Date(record.created_at),
                    duration: record.duration
                }));
                setRecordings(formattedRecordings);
            }
        } catch (error) {
            console.error("Error fetching recordings:", error);
            toast.error("Failed to load past recordings");
        }
    };

    const stopMediaStream = () => {
        if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
            const stream = videoPreviewRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoPreviewRef.current.srcObject = null;
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: mode === 'video'
            });

            if (mode === 'video' && videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mode === 'video' ? 'video/webm' : 'audio/webm' });
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${mode === 'video' ? 'webm' : 'webm'}`;

                toast.loading("Uploading evidence...", { id: "upload-toast" });

                try {
                    // Upload to storage
                    const { error: uploadError } = await supabase.storage
                        .from('evidence')
                        .upload(fileName, blob, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('evidence')
                        .getPublicUrl(fileName);

                    // Save to database
                    const { data: dbData, error: dbError } = await supabase
                        .from('evidence')
                        .insert([
                            {
                                type: mode,
                                duration: duration,
                                file_path: fileName,
                                public_url: publicUrl
                            }
                        ])
                        .select()
                        .single();

                    if (dbError) throw dbError;

                    const newRecording: Recording = {
                        id: dbData.id,
                        type: mode,
                        url: publicUrl,
                        timestamp: new Date(dbData.created_at),
                        duration: duration
                    };

                    setRecordings(prev => [newRecording, ...prev]);
                    toast.success("Evidence Secured in Cloud", { id: "upload-toast", description: "Recording uploaded safely" });
                } catch (error) {
                    console.error("Error saving evidence:", error);
                    toast.error("Upload Failed", { id: "upload-toast", description: "Failed to save evidence to cloud" });
                } finally {
                    stopMediaStream();
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Timer
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing media devices:", error);
            toast.error("Permission Denied", { description: "Camera/Microphone access required" });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const deleteRecording = async (id: string) => {
        try {
            const { error } = await supabase
                .from('evidence')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRecordings(prev => prev.filter(rec => rec.id !== id));
            toast.info("Recording Deleted");
        } catch (error) {
            console.error("Error deleting evidence:", error);
            toast.error("Failed to delete recording");
        }
    };

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
                        Evidence Recorder
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto z-10 scrollbar-hide pb-24 space-y-6">

                {/* Recorder Card */}
                <Card className="p-6 border-none shadow-lg bg-white/50 dark:bg-card/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6">

                        {/* Mode Switcher */}
                        <div className="flex bg-muted p-1 rounded-full w-full max-w-xs">
                            <button
                                onClick={() => !isRecording && setMode('audio')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${mode === 'audio' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                disabled={isRecording}
                            >
                                <Mic className="w-4 h-4" /> Audio
                            </button>
                            <button
                                onClick={() => !isRecording && setMode('video')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${mode === 'video' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                disabled={isRecording}
                            >
                                <Video className="w-4 h-4" /> Video
                            </button>
                        </div>

                        {/* Visualizer / Preview */}
                        <div className="w-full aspect-video bg-black/5 dark:bg-black/20 rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-border">
                            {mode === 'video' ? (
                                isRecording ? (
                                    <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs">Camera Inactive</span>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    {isRecording ? (
                                        <div className="flex gap-1 items-end h-16">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }} />
                                            ))}
                                        </div>
                                    ) : (
                                        <Mic className="w-16 h-16 text-muted-foreground/30" />
                                    )}
                                </div>
                            )}

                            {isRecording && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    REC {formatTime(duration)}
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <Button
                            size="lg"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                        >
                            {isRecording ? <Square className="w-8 h-8 fill-current" /> : (mode === 'audio' ? <Mic className="w-8 h-8" /> : <Video className="w-8 h-8" />)}
                        </Button>

                        <p className="text-sm text-muted-foreground font-medium">
                            {isRecording ? "Recording in progress..." : "Tap to start recording"}
                        </p>
                    </div>
                </Card>

                {/* Recordings List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Save className="w-4 h-4" /> Saved Evidence
                    </h3>

                    {recordings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2 border-border/50">
                            <p>No recordings yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recordings.map((rec) => (
                                <div key={rec.id} className="bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${rec.type === 'audio' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {rec.type === 'audio' ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Evidence #{rec.id.slice(-4)}</p>
                                            <p className="text-xs text-muted-foreground">{rec.timestamp.toLocaleTimeString()} • {formatTime(rec.duration)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteRecording(rec.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
