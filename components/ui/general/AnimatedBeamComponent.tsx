"use client"

import React, { RefObject, useEffect, useId, useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion" // Or "motion/react" if using Motion One
import { cn } from "@/lib/utils"

// --- 1. Low-Level Beam Component ---

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId()
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const rectA = fromRef.current.getBoundingClientRect()
        const rectB = toRef.current.getBoundingClientRect()

        const svgWidth = containerRect.width
        const svgHeight = containerRect.height
        setSvgDimensions({ width: svgWidth, height: svgHeight })

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset

        const controlY = startY - curvature
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`
        setPathD(d)
      }
    }

    const resizeObserver = new ResizeObserver(() => updatePath())
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    updatePath()
    return () => resizeObserver.disconnect()
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute top-0 left-0 transform-gpu stroke-2",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits={"userSpaceOnUse"}
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0"></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

// --- 2. High-Level Component Implementation ---

export interface NodeData {
  name: string
  logo: string
  status: string
  link?: string
}

export interface AnimatedBeamComponentProps {
  nodes: NodeData[]
  centerNode: { name: string; logo: string; status: string }
  onNodeClick?: (nodeName: string) => void
}

const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; onClick?: () => void }
>(({ className, children, onClick }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
})
Circle.displayName = "Circle"

export const AnimatedBeamComponent: React.FC<AnimatedBeamComponentProps> = ({
  nodes,
  centerNode,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  
  // We split nodes into left and right columns for a balanced graph look
  const midPoint = Math.ceil(nodes.length / 2)
  const leftNodes = nodes.slice(0, midPoint)
  const rightNodes = nodes.slice(midPoint)

  const [leftRefs, setLeftRefs] = useState<RefObject<HTMLDivElement | null>[]>([])
  const [rightRefs, setRightRefs] = useState<RefObject<HTMLDivElement | null>[]>([])

  useEffect(() => {
    setLeftRefs((el) => Array(leftNodes.length).fill(0).map((_, i) => el[i] || React.createRef()))
    setRightRefs((el) => Array(rightNodes.length).fill(0).map((_, i) => el[i] || React.createRef()))
  }, [leftNodes.length, rightNodes.length])

  return (
    <div
      className="relative flex h-[400px] w-full items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-background p-10 md:shadow-xl"
      ref={containerRef}
    >
      {/* Left Column */}
      <div className="flex flex-col justify-between gap-8 h-full">
        {leftNodes.map((node, idx) => (
          <div key={node.name} className="flex flex-col items-center gap-1">
             <Circle ref={leftRefs[idx]} onClick={() => onNodeClick?.(node.name)} className="border-white/20 bg-black/50">
               <Image src={node.logo} alt={node.name} width={40} height={40} className="object-contain rounded-full" />
             </Circle>
             <span className="text-xs text-white/70 font-medium">{node.name}</span>
          </div>
        ))}
      </div>

      {/* Center Node */}
      <div className="flex flex-col items-center z-20">
        <Circle ref={centerRef} className="h-24 w-24 border-purple-500/50 bg-black/80 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]">
           <Image src={centerNode.logo} alt={centerNode.name} width={60} height={60} className="object-contain rounded-md" />
        </Circle>
        <span className="text-sm text-white font-bold mt-2 bg-black/50 px-2 py-0.5 rounded">{centerNode.name}</span>
      </div>

      {/* Right Column */}
      <div className="flex flex-col justify-between gap-8 h-full">
        {rightNodes.map((node, idx) => (
          <div key={node.name} className="flex flex-col items-center gap-1">
             <Circle ref={rightRefs[idx]} onClick={() => onNodeClick?.(node.name)} className="border-white/20 bg-black/50">
               <Image src={node.logo} alt={node.name} width={40} height={40} className="object-contain rounded-full" />
             </Circle>
             <span className="text-xs text-white/70 font-medium">{node.name}</span>
          </div>
        ))}
      </div>

      {/* Beams: Left to Center */}
      {leftRefs.map((ref, idx) => (
        <AnimatedBeam
          key={`left-${idx}`}
          containerRef={containerRef}
          fromRef={ref}
          toRef={centerRef}
          duration={3}
          curvature={20}
          endXOffset={-10}
        />
      ))}

      {/* Beams: Right to Center */}
      {rightRefs.map((ref, idx) => (
        <AnimatedBeam
          key={`right-${idx}`}
          containerRef={containerRef}
          fromRef={ref} // Direction: From Node To Center
          toRef={centerRef}
          duration={3}
          curvature={-20}
          reverse={true} // Animate outwards or inwards depending on preference
          startXOffset={10}
        />
      ))}
    </div>
  )
}