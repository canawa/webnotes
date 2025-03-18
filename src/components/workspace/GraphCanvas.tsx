import React, { useRef, useEffect, useState } from "react";
import { Force, ForceLink, ForceNode } from "d3-force";
import * as d3 from "d3";
import { Plus, Moon, Sun, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTheme } from "@/lib/theme";

interface Node {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string;
  target: string;
  id: string;
}

interface GraphCanvasProps {
  nodes?: Node[];
  links?: Link[];
  onNodeClick?: (node: Node) => void;
  onCreateNode?: (position: { x: number; y: number }) => void;
  onConnectNodes?: (sourceId: string, targetId: string) => void;
  onDisconnectNodes?: (linkId: string) => void;
}

const GraphCanvas = ({
  nodes = [
    { id: "1", title: "Task 1" },
    { id: "2", title: "Task 2" },
    { id: "3", title: "Task 3" },
  ],
  links = [
    { source: "1", target: "2", id: "link-1-2" },
    { source: "2", target: "3", id: "link-2-3" },
  ],
  onNodeClick = () => {},
  onCreateNode = () => {},
  onConnectNodes = () => {},
  onDisconnectNodes = () => {},
}: GraphCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG group for zoom/pan
    const svg = d3.select(svgRef.current);
    const g = svg.append("g");

    // Setup zoom behavior
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior as any);

    // Initialize force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const linkGroup = g
      .append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(links)
      .enter()
      .append("g");

    // Add the actual line
    const link = linkGroup
      .append("line")
      .attr("stroke", theme === "dark" ? "#60a5fa" : "rgb(211, 153, 132)")
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", 1.5);

    // Add a wider transparent line for easier clicking
    linkGroup
      .append("line")
      .attr("stroke", "transparent")
      .attr("stroke-width", 10)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this.parentNode)
          .select("line")
          .attr("stroke", theme === "dark" ? "#f97316" : "rgb(180, 120, 100)")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this.parentNode)
          .select("line")
          .attr("stroke", theme === "dark" ? "#60a5fa" : "rgb(211, 153, 132)")
          .attr("stroke-width", 1.5);
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        onDisconnectNodes(d.id);
      });

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("g");

    // Function to get node color based on priority
    const getNodeColor = (d: any) => {
      if (d.status === "completed") {
        return theme === "dark" ? "#1e40af" : "rgb(211, 153, 132)";
      }

      switch (d.priority) {
        case "low":
          return theme === "dark" ? "#1e40af" : "rgb(211, 153, 132)";
        case "medium":
          return theme === "dark" ? "#15803d" : "rgb(134, 239, 172)";
        case "high":
          return theme === "dark" ? "#9a3412" : "rgb(251, 146, 60)";
        case "urgent":
          return theme === "dark" ? "#b91c1c" : "rgb(248, 113, 113)";
        default:
          return theme === "dark" ? "#1e40af" : "rgb(211, 153, 132)";
      }
    };

    // Function to get stroke color based on priority
    const getStrokeColor = (d: any) => {
      if (d.status === "completed") {
        return theme === "dark" ? "#60a5fa" : "rgb(180, 120, 100)";
      }

      switch (d.priority) {
        case "low":
          return theme === "dark" ? "#60a5fa" : "rgb(180, 120, 100)";
        case "medium":
          return theme === "dark" ? "#4ade80" : "rgb(74, 222, 128)";
        case "high":
          return theme === "dark" ? "#fb923c" : "rgb(251, 146, 60)";
        case "urgent":
          return theme === "dark" ? "#f87171" : "rgb(248, 113, 113)";
        default:
          return theme === "dark" ? "#60a5fa" : "rgb(180, 120, 100)";
      }
    };

    // Function to get priority icon
    const getPriorityIcon = (d: any) => {
      if (!d.priority) return null;

      const iconSize = 6;
      const iconGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      iconGroup.setAttribute("class", "priority-icon");
      iconGroup.setAttribute("transform", "translate(-8, -8)");

      const iconCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      iconCircle.setAttribute("r", iconSize.toString());
      iconCircle.setAttribute("fill", getPriorityColor(d.priority));
      iconCircle.setAttribute("stroke", "white");
      iconCircle.setAttribute("stroke-width", "1");
      iconGroup.appendChild(iconCircle);

      return iconGroup;
    };

    // Function to get priority color - simplified color scheme
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "low":
          return "#3b82f6"; // Blue
        case "medium":
          return "#22c55e"; // Green
        case "high":
          return "#f97316"; // Orange
        case "urgent":
          return "#ef4444"; // Red
        default:
          return "#3b82f6"; // Default blue
      }
    };

    node
      .append("circle")
      .attr("r", 12)
      .attr("fill", (d) => getNodeColor(d))
      .attr("stroke", (d) => getStrokeColor(d))
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        event.stopPropagation();
        if (connecting) {
          onConnectNodes(connecting, d.id);
          setConnecting(null);
        } else {
          onNodeClick(d);
        }
      });

    // Add priority indicators
    node
      .each(function (d: any) {
        if (d.priority) {
          const priorityGroup = d3
            .select(this)
            .append("g")
            .attr("class", "priority-icon")
            .attr("transform", "translate(-8, -8)");

          priorityGroup
            .append("circle")
            .attr("r", 6)
            .attr("fill", getPriorityColor(d.priority))
            .attr("stroke", "white")
            .attr("stroke-width", 1);

          // Add a symbol based on priority
          if (d.priority === "urgent") {
            priorityGroup
              .append("text")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "white")
              .attr("font-size", "8px")
              .attr("font-weight", "bold")
              .text("!");
          } else if (d.priority === "high") {
            priorityGroup
              .append("text")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "white")
              .attr("font-size", "8px")
              .text("H");
          } else if (d.priority === "medium") {
            priorityGroup
              .append("text")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "white")
              .attr("font-size", "8px")
              .text("M");
          } else if (d.priority === "low") {
            priorityGroup
              .append("text")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "white")
              .attr("font-size", "8px")
              .text("L");
          }
        }
      })
      .on("contextmenu", (event, d) => {
        event.preventDefault();
        // Remove any existing context menus first
        d3.selectAll(
          "body > div.absolute.border.rounded-md.shadow-lg.z-50.py-1",
        ).remove();

        // Show context menu options
        const contextMenu = d3
          .select("body")
          .append("div")
          .attr(
            "class",
            `absolute ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-md shadow-lg z-50 py-1`,
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);

        // Add connect option
        contextMenu
          .append("div")
          .attr(
            "class",
            `px-4 py-2 text-sm ${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"} cursor-pointer`,
          )
          .text("Connect to another task")
          .on("click", () => {
            setConnecting(d.id);
            contextMenu.remove();
          });

        // Add disconnect option
        contextMenu
          .append("div")
          .attr(
            "class",
            `px-4 py-2 text-sm ${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"} cursor-pointer`,
          )
          .text("Disconnect from all tasks")
          .on("click", () => {
            // Find all connections involving this node
            const nodeConnections = links.filter(
              (link) =>
                link.source === d.id ||
                link.target === d.id ||
                (typeof link.source === "object" && link.source.id === d.id) ||
                (typeof link.target === "object" && link.target.id === d.id),
            );

            // Disconnect all connections
            nodeConnections.forEach((conn) => {
              onDisconnectNodes(conn.id);
            });

            contextMenu.remove();
          });

        // Close context menu when clicking elsewhere
        d3.select("body").on("click.context-menu", () => {
          contextMenu.remove();
          d3.select("body").on("click.context-menu", null);
        });
      });

    // Add checkmark for completed tasks
    node
      .append("g")
      .attr("class", "checkmark")
      .attr("display", (d) => (d.status === "completed" ? null : "none"))
      .append("circle")
      .attr("r", 6)
      .attr("fill", "#22c55e")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("cx", 0)
      .attr("cy", 0);

    // Add checkmark symbol
    node
      .select(".checkmark")
      .append("path")
      .attr("d", "M -2,0 L -1,1 L 2,-1")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("fill", "none");

    // Add title labels with better visibility
    node
      .append("text")
      .text((d) => d.title)
      .attr("x", 15)
      .attr("y", 5)
      .attr("font-size", "12px")
      .attr("fill", theme === "dark" ? "#ffffff" : "#1e293b")
      .attr("font-weight", "500")
      .attr("stroke", theme === "dark" ? "#0f172a" : "#1e293b")
      .attr("stroke-width", "0.5px");

    // Add drag behavior
    node.call(
      d3
        .drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          // Keep the node fixed at its new position
          // d.fx = null;
          // d.fy = null;
        }) as any,
    );

    // Update positions on simulation tick
    simulation.on("tick", () => {
      linkGroup
        .selectAll("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Handle canvas click for creating new nodes
    svg.on("click", (event) => {
      if (connecting) {
        setConnecting(null);
        return;
      }

      const [x, y] = d3.pointer(event);
      const transform = d3.zoomTransform(svg.node() as any);

      // Convert coordinates to account for zoom and pan
      const realX = (x - transform.x) / transform.k;
      const realY = (y - transform.y) / transform.k;

      onCreateNode({ x: realX, y: realY });
    });

    // Handle right-click on canvas for context menu
    svg.on("contextmenu", (event) => {
      event.preventDefault();

      // Remove any existing context menus first
      d3.selectAll(
        "body > div.absolute.border.rounded-md.shadow-lg.z-50.py-1",
      ).remove();

      const [x, y] = d3.pointer(event);
      const transform = d3.zoomTransform(svg.node() as any);

      // Convert coordinates to account for zoom and pan
      const realX = (x - transform.x) / transform.k;
      const realY = (y - transform.y) / transform.k;

      // Create context menu
      const contextMenu = d3
        .select("body")
        .append("div")
        .attr(
          "class",
          `absolute ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-md shadow-lg z-50 py-1`,
        )
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);

      // Add "Create Task" option
      contextMenu
        .append("div")
        .attr(
          "class",
          `px-4 py-2 text-sm ${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"} cursor-pointer flex items-center`,
        )
        .html(
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Create Task`,
        )
        .on("click", () => {
          onCreateNode({ x: realX, y: realY });
          contextMenu.remove();
        });

      // Close context menu when clicking elsewhere
      d3.select("body").on("click.canvas-context-menu", () => {
        contextMenu.remove();
        d3.select("body").on("click.canvas-context-menu", null);
      });
    });

    // Add right-click drag for panning
    const rightClickDrag = d3
      .drag()
      .filter((event) => event.button === 2) // Only trigger on right mouse button
      .on("start", function (event) {
        event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
      })
      .on("drag", function (event) {
        const transform = d3.zoomTransform(svg.node() as any);
        const newTransform = d3.zoomIdentity
          .translate(transform.x + event.dx, transform.y + event.dy)
          .scale(transform.k);

        svg.call(zoomBehavior.transform as any, newTransform);
      });

    svg.call(rightClickDrag as any);

    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    links,
    onNodeClick,
    onCreateNode,
    onConnectNodes,
    connecting,
    theme,
  ]);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden graph-canvas">
      <svg ref={svgRef} className="w-full h-full cursor-crosshair">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl justify-center items-center">
          Header 1
        </h1>
      </svg>
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm text-foreground px-3 py-2 rounded-md text-sm font-medium shadow-lg border border-border">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Add Task Button - Centered at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="round"
                className="bg-primary hover:bg-primary/90 shadow-lg"
                onClick={() => {
                  const svg = d3.select(svgRef.current);
                  const [width, height] = [
                    svg.node()?.clientWidth,
                    svg.node()?.clientHeight,
                  ];
                  if (width && height) {
                    onCreateNode({ x: width / 2, y: height / 2 });
                  }
                }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add New Task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {connecting && (
        <div className="absolute top-16 left-4 bg-yellow-600 text-white px-4 py-2 rounded-md font-medium shadow-lg border border-yellow-500">
          Connecting: Click on another node to create a link
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
