"use client"

import React, { RefObject, useEffect, useId, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null> // Container ref
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
  reverse = false, // Include the reverse prop
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

  // Calculate the gradient coordinates based on the reverse prop
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

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updatePath()
    })

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Call the updatePath initially to set the initial path
    updatePath()

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect()
    }
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ])

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
          initial={{
            x1: "0%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

// --- High-Level Component Implementation ---

interface NodeData {
  name: string;
  logo: string;
  status: string;
  link?: string;
}

interface AnimatedBeamComponentProps {
  nodes: NodeData[];
  centerNode: NodeData;
  onNodeClick?: (nodeName: string) => void;
}

export const AnimatedBeamComponent: React.FC<AnimatedBeamComponentProps> = ({
  nodes,
  centerNode,
  onNodeClick,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const centerRef = React.useRef<HTMLDivElement>(null);
  const [nodeRefs, setNodeRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs((refs) =>
      Array(nodes.length)
        .fill(0)
        .map((_, i) => refs[i] || React.createRef())
    );
  }, [nodes.length]);

  return (
    <div
      className="relative flex w-full max-w-4xl items-center justify-center overflow-hidden rounded-lg bg-background p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between gap-2">
          {nodes.slice(0, 3).map((node, idx) => (
            <div
              key={node.name}
              ref={nodeRefs[idx]}
              className="z-10 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => onNodeClick?.(node.name)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 p-2 shadow-sm hover:scale-110 transition-transform">
                <img src={node.logo} alt={node.name} className="h-full w-full object-contain rounded-full" />
              </div>
              <span className="text-xs font-medium text-white/70">{node.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-row justify-center">
            <div
              ref={centerRef}
              className="z-10 flex flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/50 p-3 shadow-lg shadow-purple-500/20">
                 <img src={centerNode.logo} alt={centerNode.name} className="h-full w-full object-contain" />
              </div>
               <span className="text-sm font-bold text-white">{centerNode.name}</span>
            </div>
        </div>

        <div className="flex flex-row justify-between gap-2">
           {nodes.slice(3).map((node, idx) => (
            <div
              key={node.name}
              ref={nodeRefs[idx + 3]}
              className="z-10 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => onNodeClick?.(node.name)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 p-2 shadow-sm hover:scale-110 transition-transform">
                <img src={node.logo} alt={node.name} className="h-full w-full object-contain rounded-full" />
              </div>
              <span className="text-xs font-medium text-white/70">{node.name}</span>
            </div>
          ))}
        </div>
      </div>

      {nodeRefs.map((ref, idx) => (
        <AnimatedBeam
          key={idx}
          containerRef={containerRef}
          fromRef={ref}
          toRef={centerRef}
          duration={3}
          reverse={true}
        />
      ))}
    </div>
  );
};
