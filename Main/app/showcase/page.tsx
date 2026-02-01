"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import CollectionGrid from "@/components/collection-grid"
import TagFilters from "@/components/tag-filters"
import Loading from "@/components/loading"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"

export default function ShowcasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [heroImage, setHeroImage] = useState<string>("")
  const [query, setQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    let isMounted = true
    fetch("/api/cloudinary/collections?featured=true")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        const firstImage = data.collections?.[0]?.coverImage || ""
        setHeroImage(firstImage)
      })
      .catch(() => {
        if (!isMounted) return
        setHeroImage("")
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const updateQueryParam = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("q", value.trim())
    } else {
      params.delete("q")
    }
    router.push(`/showcase?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-neutral-900 dark:bg-[#0a0a0a] dark:text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage || "/placeholder.svg"}
            alt="Photography collections showcase"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/20" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-6 px-6 py-20 text-left md:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">Showcase</p>
          <h1 className="text-5xl md:text-6xl text-white">Photography Collections</h1>
          <p className="max-w-2xl text-lg text-white/85">
            Curated albums built to highlight portraits, landscapes, commercial work, and story-driven events.
          </p>
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:flex-row md:items-center">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.3em] text-white/70">Search collections</label>
              <input
                value={query}
                onChange={(event) => {
                  const value = event.target.value
                  setQuery(value)
                  updateQueryParam(value)
                }}
                placeholder="Try “Portraits”, “Events”, or “Dallas”"
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/90 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <span className="h-10 w-[1px] bg-white/20 hidden md:block" />
              <div className="text-xs uppercase tracking-[0.3em]">Filter by tags</div>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section
        className="mx-auto -mt-10 max-w-6xl px-6 md:px-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900/90">
          <div className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
            Browse by tag
          </div>
          <TagFilters />
        </div>
      </motion.section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10">
        <Suspense fallback={<Loading />}>
          <CollectionGrid />
        </Suspense>
      </section>
    </div>
  )
}
