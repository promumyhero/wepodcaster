import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from "@/hooks/use-toast"
import { useUploadFiles } from '@xixixao/uploadstuff/react'
/**
 * Hook `useGeneratePodcast` adalah hook kustom React untuk mengelola pembuatan podcast dari prompt teks menggunakan AI.
 * 
 * - Properti yang diterima oleh hook ini, termasuk `setAudio`, `voiceType`, `voicePrompt`, dan `setAudioStorageId`.
 * 
 * Hook ini mengelola status `isGenerating` dan menggunakan beberapa hook lain untuk berinteraksi dengan API:
 * - `useToast` untuk notifikasi.
 * - `useMutation` untuk mutasi URL unggahan dan mendapatkan URL audio.
 * - `useUploadFiles` untuk unggahan file.
 * - `useAction` untuk aksi pembuatan audio podcast.
 * 
 * Fungsi `generatePodcast` mengatur proses pembuatan podcast:
 * 1. Mengatur `isGenerating` dan mengosongkan audio.
 * 2. Memeriksa `voicePrompt` dan menampilkan notifikasi jika kosong.
 * 3. Memanggil `getPodcastAudio` untuk menghasilkan audio.
 * 4. Membuat `Blob` dan `File` dari respons.
 * 5. Mengunggah file dan mengambil `storageId`.
 * 6. Mengatur `storageId` dan mendapatkan URL audio.
 * 7. Mengatur audio dan `isGenerating`, serta menampilkan notifikasi sukses.
 * 
 * Jika terjadi kesalahan, kesalahan dicatat dan notifikasi destruktif ditampilkan. `isGenerating` diatur menjadi `false`.
 * 
 * Hook ini mengembalikan status `isGenerating` dan fungsi `generatePodcast`.
 */

const useGeneratePodcast = ({
  setAudio, voiceType, voicePrompt, setAudioStorageId
}: GeneratePodcastProps ) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast()
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const { startUpload } = useUploadFiles(generateUploadUrl);

  const getPodcastAudio = useAction(api.openai.generateAudioAction);
  // mendapatkan url dari audio yang di generate
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);

    setAudio('');
    if(!voicePrompt) {
        toast({
          title: "please provide a voiceType to generate podcast",
        })
        return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt
      })
      // Membuat objek Blob baru dari data respons dengan tipe MIME 'audio/mpeg'.
      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({storageId});
      // set audio url ke state
      setAudio(audioUrl!);
      // set is generating ke false
      setIsGenerating(false);
      // jika berhasil
      toast({
        title: "Podcast generated successfully",
      })
    } catch (error) {
      // jika terjadi error
      console.log('Error generating podcast', error)
      toast({
        title: "Error creating podcast",
        variant: "destructive"
      })
      setIsGenerating(false);
    }
  }

  return {
    isGenerating,
    generatePodcast
  }
}

/**
 * Komponen `GeneratePodcast` adalah komponen fungsional React yang digunakan untuk menghasilkan podcast berdasarkan prompt AI.
 * - Menggunakan hook `useGeneratePodcast` untuk mengelola status `isGenerating` dan fungsi `generatePodcast`.
 * - Menampilkan input teks untuk memasukkan prompt AI.
 * - Menampilkan tombol untuk memulai proses pembuatan podcast. Jika sedang dalam proses (`isGenerating`), tombol akan menampilkan teks "Generating" dan animasi pemuatan.
 * - Jika audio telah dihasilkan, menampilkan elemen audio dengan kontrol pemutaran.
 */
const GeneratePodcast = (props: GeneratePodcastProps) => {
    const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  return (
    <div>
        <div className="flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
                AI Prompt to generate podcast
            </Label>
            <Textarea 
                className="input-class font-light focus-visible:ring-offset-orange-1"
                placeholder="Provide text to generate audio"
                rows={5}
                value={props.voicePrompt}
                onChange={(e) => props.setVoicePrompt(e.target.value)}
            />
        </div>
        <div className="mt-5 w-full max-w-[200px]">
            <Button type="submit" className="text-16 bg-orange-1 py-4 font-bold text-white-1" onClick={generatePodcast}>
                {isGenerating ? (
                  <>
                    Generating
                    <Loader size={20} className="animate-spin mr-2"/>
                  </>
                ): (
                  "Generate"
                )}
            </Button>
        </div>
        {props.audio && (
            <audio 
                controls
                src={props.audio}
                autoPlay
                className="mt-5"
                onLoadedMetadata={(e) => props.setAudioDuration(e.currentTarget.duration)}
            />
        )}
    </div>

  )
}

export default GeneratePodcast