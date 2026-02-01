"use client"

import Image from "next/image"
import { ArrowRight, Camera, Globe, Award, Users } from "lucide-react"
import { motion } from "framer-motion"
import AnimatedButton from "@/components/animated-button"
import { useEffect, useState } from "react"

export default function AboutPage() {
  const [heroImage, setHeroImage] = useState<string>("")
  const [bioImage, setBioImage] = useState<string>("")

  useEffect(() => {
    let isMounted = true
    fetch("/api/cloudinary/author")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        const authorImage = data.image || ""
        setHeroImage(authorImage)
        setBioImage(authorImage)
      })
      .catch(() => {
        if (!isMounted) return
        setHeroImage("")
        setBioImage("")
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full">
        <Image
          src={heroImage || "/placeholder.svg"}
          alt="About Srivibhu Ponakala"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl text-white mb-4">About Me</h1>
          <p className="text-white/90 text-lg max-w-2xl">Capturing the drive behind the details</p>
        </motion.div>
      </section>
      <div className="header-height"></div>

      {/* Bio Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative h-[600px] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src={bioImage || "/placeholder.svg"}
              alt="Photographer portrait"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl mb-6">Capturing the Drive | Srivibhu Ponakala</h2>
            <p className="text-primary mb-4">
              I’m a photographer based in Amherst, MA and Central Jersey, with roots in the NYC area and the Boston
              area. I’m currently studying Computer Science at UMass Amherst, and my work blends a technical eye with
              a love for real, lived moments.
            </p>
            <p className="text-primary mb-4">
              From performance sedans to candid travel scenes, I’m drawn to clean composition, intentional light, and
              the story behind the frame. I’m self‑taught, and every project pushes me to refine the craft.
            </p>
            <p className="text-primary mb-6">
              Whether it’s a car meet, a quiet street in Europe, or a personal project at home, I aim for images that
              feel sharp, honest, and alive.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-primary" />
                <span className="text-primary">Sony A7R3</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                <span className="text-primary">6+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={20} className="text-primary" />
                <span className="text-primary">Self-taught</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span className="text-primary">NYC · Boston · Central NJ</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            What I Shoot
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Automotive",
                description:
                  "From aggressive stances to subtle design lines, I focus on character, light, and presence.",
              },
              {
                title: "Travel & Lifestyle",
                description:
                  "Documenting places, people, and atmosphere with clean composition and story‑first framing.",
              },
              {
                title: "Personal Projects",
                description:
                  "Constant experiments—new techniques, color studies, and high‑energy subjects.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="text-primary dark:text-primary-secondary bg-primary-secondary dark:bg-primary p-8 rounded-2xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-primary-secondary dark:text-primary-foreground text-xl mb-4">{item.title}</h3>
                <p className="text-primary-secondary dark:text-primary-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          My Journey
        </motion.h2>
        <div className="space-y-12">
          {[
            {
              year: "2023",
              title: "The Foundation",
              description:
                "Took on my first job as a high‑school sophomore to save for my first professional camera setup.",
            },
            {
              year: "2024",
              title: "From Meets to Markets",
              description:
                "Started photographing performance cars at local meets and sold high‑resolution prints and digital files to the community.",
            },
            {
              year: "2024–2025",
              title: "Impact Through Imagery",
              description:
                "Partnered with non‑profits to document their work, helping them expand outreach through clean, story‑driven visuals.",
            },
            {
              year: "May–July 2025",
              title: "Global Perspective",
              description:
                "Photography Intern at Sadhu Vaswani Mission, sharpening technical skills in a fast‑paced, mission‑driven environment.",
            },
            {
              year: "Fall 2025",
              title: "International Expansion",
              description:
                "Documented life in Paris through the UMass Global Launch Program, focusing on architecture and street culture.",
            },
            {
              year: "Present",
              title: "The Technical Edge",
              description:
                "Blending Computer Science at UMass Amherst with automotive and lifestyle photography for precision and high‑end post‑processing.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.year}
              className="flex flex-col md:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="md:w-1/4">
                <h3 className="text-xl">{item.year}</h3>
              </div>
              <div className="md:w-3/4">
                <h4 className="font-medium text-2xl mb-2">{item.title}</h4>
                <p className="text-primary">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="min-w-[90%] justify-self-center mr-4 ml-4 py-20 my-20 px-4 md:px-8 rounded-3xl border-[1px] border-border">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-primary text-3xl md:text-4xl mb-6">Collaborate?</h2>
          <p className="text-primary max-w-2xl mx-auto mb-8">
            Whether you're looking for prints, licensing, or a custom photography project, feel free to get in touch.
          </p>
          <AnimatedButton href="/contact" variant="primary" icon={<ArrowRight size={18} />}>
            Get in Touch
          </AnimatedButton>
        </motion.div>
      </section>
    </div>
  )
}
