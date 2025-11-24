"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // If already logged in, bypass landing and route by role
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "designer") {
        router.replace("/designer/dashboard")
      } else {
        router.replace("/recommendations")
      }
    }
  }, [user, isLoading, router])

  const handleGetStarted = () => {
    // Mark landing as shown once
    if (typeof window !== "undefined") {
      localStorage.setItem("landingShown", "true")
    }

    // If logged in, route by role
    if (user?.role === "designer") {
      router.push("/designer/dashboard")
      return
    }
    if (user?.role === "user") {
      router.push("/recommendations")
      return
    }

    // If not logged in, go to signup
    router.push("/auth/signup")
  }

  // Allow content render for first-time or logged-out users
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-8"
        >
          <Image
            src="/aura-blend-logo.jpg"
            alt="Aura Blend logo"
            width={240}
            height={240}
            priority
            className="mx-auto h-40 w-auto object-contain"
          />
        </motion.div>

        {/* Slogan */}
        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-serif text-3xl md:text-4xl font-semibold text-center mb-4"
          style={{ color: "#b58b00" }} // gold accent
        >
          Blend your Style, Elevate your Aura
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="font-sans text-base md:text-lg text-foreground/90 leading-7 md:leading-8 max-w-3xl mx-auto text-pretty"
        >
          Our app is a game-changing platform that reimagines how jewelry and accessories are discovered and styled.
          Powered by cutting-edge AI, it scans users’ outfits, skin tones, and personal style through simple photo
          uploads to deliver effortless, personalized recommendations for any occasion—whether it’s a wedding, a
          business event, or a casual day out. By replacing hours of browsing or store-hopping with instant, curated
          suggestions, the app helps users not only save time but also feel more confident in their choices. With its
          inclusive, gender-neutral design, it celebrates every individual’s unique identity, making accessory styling
          simple, convenient, and truly personal.
          <br />
          <br />
          At the same time, the platform acts as a powerful showcase for Indian jewelry and accessory designers. From
          rising talents to established names, creators can present their catalogs, manage offerings, and engage
          directly with a diverse audience eager for authentic craftsmanship. By leveling the playing field through
          visibility, referral traffic, reports, and promotional tools, the app helps independent labels thrive while
          giving users access to a rich variety of designs rooted in Indian artistry. By seamlessly connecting
          personalization with creative discovery, it bridges the gap between technology and tradition—empowering users
          to express themselves confidently while enabling designers to grow and shine.
        </motion.p>

        {/* Get Started */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-10"
        >
          <Button
            onClick={handleGetStarted}
            className="mx-auto block px-8 py-6 text-lg rounded-xl text-black font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 hover-glow"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </main>
  )
}
