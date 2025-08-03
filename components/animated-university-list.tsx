"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { University } from "@/app/generated/prisma";

const universityPartnersData = [
  {
    id: "uew",
    name: "University of Winneba",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/University_of_Education%2C_Winneba_%28UEW%29_North_Campus.jpg/500px-University_of_Education%2C_Winneba_%28UEW%29_North_Campus.jpg",
  },
  {
    id: "knust",
    name: "Kwame Nkrumah University of Science and Technology",
    logoUrl:
      "https://ghanaremembers.com/images/asset/YXJ0aWNsZV9pbWFnZXMvcHVibGljL2tudXN0LmpwZw/knust.jpg?p=page_featured&s=5cb5c7ac00cc1897a575e3fee9a4d1e1",
  },
  {
    id: "ug",
    name: "University of Ghana",
    logoUrl:
      "https://www.ug.edu.gh/sites/default/files/2022-07/UG18-PDF-26.jpg",
  },

  {
    id: "ucc",
    name: "University of Cape Coast",
    logoUrl:
      "https://i0.wp.com/meqasa.com/blog/wp-content/uploads/2017/08/university-of-cape-cost-entrance-1024x685.jpg?resize=900%2C602",
  },
] as const;

interface AnimatedUniversityListProps {
  universities: University[] | null;
}

const listVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const AnimatedUniversityList = ({
  universities,
}: AnimatedUniversityListProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {universities?.map((university, index) => (
        <motion.div
          key={university.id}
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 30px -5px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href={`/hostels?university=${university.id}`}
            className="block bg-background rounded-xl overflow-hidden shadow-md transition-shadow h-full"
          >
            <div className="relative h-56">
              <Image
                src={
                  universityPartnersData[index].logoUrl || "/placeholder.svg"
                }
                alt={university.name}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl text-white -mt-12 z-10 relative">
                {university.name}
              </h3>
              <p className="text-muted-foreground mt-2">
                {university.location}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}; 