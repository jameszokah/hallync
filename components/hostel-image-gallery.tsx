"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HostelImageGalleryProps {
  images: string[];
  hostelName: string;
}

export function HostelImageGallery({ images, hostelName }: HostelImageGalleryProps) {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openPhotoGallery = (initialIndex = 0) => {
    setCurrentPhotoIndex(initialIndex);
    setShowPhotoGallery(true);
    document.body.style.overflow = "hidden";
  };

  const closePhotoGallery = () => {
    setShowPhotoGallery(false);
    document.body.style.overflow = "auto";
  };
  
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <>
      {showPhotoGallery && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closePhotoGallery}
        >
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={closePhotoGallery}
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
            <Carousel
              opts={{ loop: true, startIndex: currentPhotoIndex }}
              className="w-full h-full"
            >
              <CarouselContent className="h-full">
                {images.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="relative h-full w-full">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${hostelName} - Photo ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 md:left-8 text-white bg-black/20 hover:bg-black/40 border-none" />
              <CarouselNext className="absolute right-4 md:right-8 text-white bg-black/20 hover:bg-black/40 border-none" />
            </Carousel>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-lg overflow-hidden h-96">
        {images.slice(0, 5).map((image, index) => (
          <div
            key={index}
            className={cn(
              'relative cursor-pointer group',
              index === 0 && 'col-span-2 row-span-2',
            )}
            onClick={() => openPhotoGallery(index)}
          >
            <Image
              src={image}
              alt={`${hostelName} - Photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            
            {index === 4 && images.length > 5 && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/50"
                onClick={(e) => { e.stopPropagation(); openPhotoGallery(4); }}
              >
                <span className="text-white text-2xl font-bold">+{images.length - 5}</span>
              </div>
            )}
            {index === 0 && (
              <Button 
                className="absolute bottom-4 right-4" 
                onClick={(e) => { e.stopPropagation(); openPhotoGallery(0); }}
                variant="secondary"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Show all photos
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
