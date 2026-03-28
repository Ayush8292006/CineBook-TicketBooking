import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import BlurCircle from './BlurCircle'
import { Play, Film, Info } from 'lucide-react'

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  return (
    <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-24 overflow-hidden bg-[#020202]'>
      
      {/* 🌌 Cinematic Glow Backgrounds */}
      <BlurCircle top='-10%' left='10%' color="bg-primary" opacity="opacity-5" />
      <BlurCircle bottom='20%' right='-5%' color="bg-primary" opacity="opacity-10" />

      {/* Header with Visual Hierarchy */}
      <div className='flex flex-col items-center mb-16 space-y-3'>
        <div className='flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.5em]'>
           <Film className='w-3 h-3' /> Behind the Scenes
        </div>
        <h2 className='text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white/90'>
          Official <span className='text-primary/80'>Trailers</span>
        </h2>
        <div className='w-24 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full' />
      </div>

      <div className='relative max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
          
          {/* 🎬 Main Player Area (8 Columns) */}
          <div className='lg:col-span-8 group'>
            <div className='relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/5 bg-black'>
              {/* Subtle hover glow behind player */}
              <div className='absolute -inset-2 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700' />
              
              <iframe
                className='w-full h-full relative z-10'
                src={currentTrailer?.videoUrl.replace("watch?v=", "embed/") + "?rel=0&autoplay=0&modestbranding=1"}
                title="Cinematic Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Trailer Info Overlay (Below Player) */}
            <div className='mt-6 px-4 flex justify-between items-center'>
                <div>
                    <h3 className='text-xl font-black uppercase italic tracking-wider text-white/90'>{currentTrailer?.image || "Now Playing"}</h3>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2'>
                        <Info className='w-3 h-3 text-primary' /> 4K Ultra HD • Official Premiere
                    </p>
                </div>
            </div>
          </div>

          {/* 🎞️ Thumbnail Sidebar (4 Columns) */}
          <div className='lg:col-span-4 flex flex-col gap-4'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 ml-1'>Up Next in Queue</p>
            
            <div className='flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-4 lg:pb-0 pr-2 custom-scrollbar'>
              {dummyTrailers.map((trailer, index) => (
                <div
                  key={index}
                  className={`group relative flex-shrink-0 lg:flex-shrink flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 cursor-pointer border ${
                    currentTrailer.videoUrl === trailer.videoUrl
                      ? 'bg-white/[0.05] border-primary/40 shadow-lg'
                      : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/10'
                  }`}
                  onClick={() => setCurrentTrailer(trailer)}
                >
                  {/* Small Thumbnail */}
                  <div className='relative w-32 h-20 md:w-40 md:h-24 lg:w-24 lg:h-16 rounded-xl overflow-hidden shrink-0'>
                    <img
                      src={trailer.image}
                      alt=''
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        currentTrailer.videoUrl === trailer.videoUrl ? 'scale-110 grayscale-0' : 'grayscale-[60%] group-hover:grayscale-0'
                      }`}
                    />
                    <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all' />
                    {currentTrailer.videoUrl === trailer.videoUrl && (
                        <div className='absolute inset-0 flex items-center justify-center bg-primary/20'>
                            <Play className='w-5 h-5 text-black fill-black' />
                        </div>
                    )}
                  </div>

                  {/* Thumbnail Text (Hidden on small mobile scroll, visible on LG) */}
                  <div className='hidden lg:block overflow-hidden'>
                    <p className={`text-[10px] font-black uppercase tracking-widest truncate ${
                        currentTrailer.videoUrl === trailer.videoUrl ? 'text-primary' : 'text-gray-400'
                    }`}>
                        {trailer.image || `Trailer #${index + 1}`}
                    </p>
                    <p className='text-[9px] font-bold text-gray-600 uppercase mt-1'>Official Clip</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default TrailerSection