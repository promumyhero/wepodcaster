"use client";
import { cn } from '@/lib/utils'
import { Progress } from "@/components/ui/progress"
import { useAudio } from '@/providers/AudioProvider';
import React, { useState } from 'react'
import Image from 'next/image';

const PodcastPlayer = () => {
    const { audio } = useAudio();
    const [currentTime, setCurrentTime] = useState(10);
    const [duration, setDuration] = useState(100);
  return (
    <div className={cn('sticky bottom-0 left-0 flex size-full flex-col', {
        hidden: !audio?.audioUrl
    })}>
        <h1 className="text-white-1 text-xl">{audio?.title}</h1>
        <Progress 
            value={(currentTime / duration) * 100}
            className="w-full"
            max={duration}
        />
        <Image 
            src={audio?.imageUrl!}
            alt="play"
            width={64}
            height={64}
            className="aspect-square rounded-xl"
        />
        <h1 className="text-white-1 text-xl">{audio?.author}</h1>
    </div>
  )
}

export default PodcastPlayer