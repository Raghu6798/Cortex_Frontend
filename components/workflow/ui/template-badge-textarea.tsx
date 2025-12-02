"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { nodesAtom, selectedNodeAtom } from "@/lib/workflow-store";
import { TemplateAutocomplete } from "./template-autocomplete";

export interface TemplateBadgeTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  rows?: number;
}

// Helper to check if a template references an existing node
function doesNodeExist(
  template: string,
  nodes: ReturnType<typeof useAtom<typeof nodesAtom>>[0]
): boolean {
  const match = template.match(/\{\{@([^:]+):([^}]+)\}\}/);
  if (!match) return false;

  const nodeId = match[1];
  return nodes.some((n) => n.id === nodeId);
}

// Helper to get display text from template by looking up current node label
function getDisplayTextForTemplate(
  template: string,
  nodes: ReturnType<typeof useAtom<typeof nodesAtom>>[0]
): string {
  // Extract nodeId and field from template: {{@nodeId:OldLabel.field}}
  const match = template.match(/\{\{@([^:]+):([^}]+)\}\}/);
  if (!match) return template;

  const nodeId = match[1];
  const rest = match[2]; // e.g., "OldLabel.field" or "OldLabel"

  // Find the current node
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    // Node not found, return as-is
    return rest;
  }

  // Replace old label with current label
  const currentLabel = node.data.label || "";
  const dotIndex = rest.indexOf(".");

  if (dotIndex === -1) {
    // No field, just the node: {{@nodeId:Label}}
    return currentLabel || rest;
  }

  // Has field: {{@nodeId:Label.field}}
  const field = rest.substring(dotIndex + 1);

  // If currentLabel is empty, fall back to the original label from the template
  if (!currentLabel) {
    return rest;
  }

  return `${currentLabel}.${field}`;
}

/**
 * A textarea component that renders template variables as styled badges
 * Converts {{@nodeId:DisplayName.field}} to badges showing "DisplayName.field"
 */
export function TemplateBadgeTextarea({
  value = "",
  onChange,
  placeholder,
  disabled,
  className,
  id,
  rows = 3,
}: TemplateBadgeTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(value);
  const shouldUpdateDisplay = useRef(true);
  const [selectedNodeId] = useAtom(selectedNodeAtom);
  const [nodes] = useAtom(nodesAtom);

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState("");
  const [autocompletePosition, setAutocompletePosition] = useState({
    top: 0,
    left: 0,
  });
  const [atSignPosition, setAtSignPosition] = useState<number | null>(null);
  const pendingCursorPosition = useRef<number | null>(null);

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      shouldUpdateDisplay.current = true;
    }
  }, [value, internalValue]);

  // Helper to add text with line breaks preserved
  const addTextWithLineBreaks = (container: HTMLElement, text: string) => {
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (line) {
        container.appendChild(document.createTextNode(line));
      }
      if (index < lines.length - 1) {
        container.appendChild(document.createElement("br"));
      }
    });
  };

  // Extract plain text from content
  const extractValue = (): string => {
    if (!contentRef.current) return "";

    let result = "";
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Check if this text node is inside a badge element
        let parent = node.parentElement;
        let isInsideBadge = false;
        while (parent && parent !== contentRef.current) {
          if (parent.getAttribute("data-template")) {
            isInsideBadge = true;
            break;
          }
          parent = parent.parentElement;
        }

        // Only add text if it's NOT inside a badge
        if (!isInsideBadge) {
          result += node.textContent;
          console.log(
            "[Textarea] extractValue: Adding text node:",
            node.textContent
          );
        } else {
          console.log(
            "[Textarea] extractValue: Skipping text inside badge:",
            node.textContent
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const template = element.getAttribute("data-template");
        if (template) {
          result += template;
          console.log("[Textarea] extractValue: Adding template:", template);
        } else if (element.tagName === "BR") {
          result += "\n";
          console.log("[Textarea] extractValue: Adding line break");
        }
      }
    }

    console.log("[Textarea] extractValue: Final result:", result);
    return result;
  };

  // Save cursor position
  const saveCursorPosition = (): { offset: number } | null => {
    if (!contentRef.current) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log("[Textarea] saveCursorPosition: No selection");
      return null;
    }

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(contentRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    let offset = 0;
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    let node;
    let found = false;

    while ((node = walker.nextNode())) {
      if (found) break;

      if (node.nodeType === Node.TEXT_NODE) {
        // Check if inside badge
        let parent = node.parentElement;
        let isInsideBadge = false;
        while (parent && parent !== contentRef.current) {
          if (parent.getAttribute("data-template")) {
            isInsideBadge = true;
            break;
          }
          parent = parent.parentElement;
        }

        if (!isInsideBadge) {
          // const textLength = (node.textContent || "").length;
          // Check if the cursor is within this text node
          if (
            node === range.endContainer ||
            (node.contains(range.endContainer) &&
              node.textContent === range.endContainer.textContent)
          ) {
            offset += range.endOffset;
            found = true;
          } else {
            // Check if we've passed the cursor position in the DOM order
            // This is tricky with ranges. Simplified approach:
            // If the range ends after this node, add its length.
            // But preCaretRange.toString().length gives the offset directly!
            // Let's use preCaretRange length, but we need to account for badges.
          }
        }
      }
    }

    // Better approach: walk the DOM and count characters until we hit the selection end
    // But we need to count badges as their template length, not display length
    offset = 0;
    const walker2 = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    while ((node = walker2.nextNode())) {
      if (
        range.endContainer === node ||
        (node.nodeType === Node.TEXT_NODE &&
          node === range.endContainer.parentNode)
      ) {
        // We found the container
        if (node.nodeType === Node.TEXT_NODE) {
          offset += range.endOffset;
        }
        found = true;
        break;
      }

      // Check if we are inside the selection (this logic is flawed for complex selections)
      // Instead, let's check if the node is fully contained in preCaretRange
      if (
        selection.containsNode(node, true) &&
        !selection.containsNode(node, false)
      ) {
        // Partially contained?
      }

      // Let's use a simpler approach:
      // Iterate through all nodes. If we haven't reached the cursor, add to offset.
      // To check if we reached cursor: compare position
    }

    // Even simpler:
    // Just re-implement extractValue but stop at cursor
    // But we need to know WHERE the cursor is relative to our walk.

    // Let's stick to the previous implementation's logic if possible, or fix it.
    // The previous implementation seemed to try to match nodes.

    // Let's try this:
    // 1. Get all text/element nodes
    // 2. For each, check if it is before or contains the cursor
    // 3. Add length accordingly

    offset = 0;
    const walker3 = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    while ((node = walker3.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        let parent = node.parentElement;
        let isInsideBadge = false;
        while (parent && parent !== contentRef.current) {
          if (parent.getAttribute("data-template")) {
            isInsideBadge = true;
            break;
          }
          parent = parent.parentElement;
        }

        if (!isInsideBadge) {
          if (node === range.endContainer) {
            offset += range.endOffset;
            found = true;
            break;
          } else if (
            range.comparePoint(node, (node.textContent || "").length) > 0
          ) {
            // Cursor is after this node
            offset += (node.textContent || "").length;
          } else {
            // Cursor is inside or before (should be caught by === check if inside)
            // If comparePoint is <= 0, it means cursor is before end of node
            // But if it was inside, it would be range.endContainer
            // So it must be before this node entirely?
            // No, we are iterating in order.
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const template = element.getAttribute("data-template");
        if (template) {
          if (range.comparePoint(element, 0) > 0) {
            // Cursor is after this element
            offset += template.length;
            console.log(
              "[Textarea] saveCursorPosition: Badge before cursor, length:",
              template.length
            );
          } else {
            // Cursor is before or inside (badges are atomic, so before)
            // If we are here, we might have passed the cursor?
          }
        } else if (element.tagName === "BR") {
          if (element === range.endContainer || element.contains(range.endContainer)) {
             found = true;
             break;
          }
          
          if (range.comparePoint(element, 0) > 0) {
             offset += 1; // Count line break as 1 character
             console.log("[Textarea] saveCursorPosition: BR before cursor");
          }
        }
      }
    }

    console.log("[Textarea] saveCursorPosition: Final offset:", offset);
    return { offset };
  };

  // Restore cursor position
  const restoreCursorPosition = (cursorPos: { offset: number } | null) => {
    if (!contentRef.current || !cursorPos) return;

    let offset = 0;
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    let node;
    let targetNode: Node | null = null;
    let targetOffset = 0;

    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = (node.textContent || "").length;
        if (offset + textLength >= cursorPos.offset) {
          targetNode = node;
          targetOffset = cursorPos.offset - offset;
          break;
        }
        offset += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const template = element.getAttribute("data-template");
        if (template) {
          if (offset + template.length >= cursorPos.offset) {
            // Position cursor after the badge
            targetNode = element.nextSibling;
            targetOffset = 0;
            if (!targetNode && element.parentNode) {
              // If no next sibling, create a text node
              targetNode = document.createTextNode("");
              element.parentNode.appendChild(targetNode);
            }
            break;
          }
          offset += template.length;
        } else if (element.tagName === "BR") {
          if (offset + 1 >= cursorPos.offset) {
            // Position cursor after the BR
            targetNode = element.nextSibling;
            targetOffset = 0;
            if (!targetNode && element.parentNode) {
              targetNode = document.createTextNode("");
              element.parentNode.appendChild(targetNode);
            }
            break;
          }
          offset += 1;
        }
      }
    }

    if (targetNode) {
      const range = document.createRange();
      const selection = window.getSelection();
      try {
        range.setStart(
          targetNode,
          Math.min(targetOffset, targetNode.textContent?.length || 0)
        );
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        contentRef.current.focus();
      } catch {
        // If positioning fails, just focus the element
        contentRef.current.focus();
      }
    }
  };

  // Parse text and render with badges
  const updateDisplay = useCallback(() => {
    if (!contentRef.current || !shouldUpdateDisplay.current) return;

    const container = contentRef.current;
    const text = internalValue || "";

    // Save cursor position before updating
    let cursorPos = isFocused ? saveCursorPosition() : null;

    // If we have a pending cursor position (from autocomplete), use that instead
    if (pendingCursorPosition.current !== null) {
      cursorPos = { offset: pendingCursorPosition.current };
      pendingCursorPosition.current = null;
    }

    // Clear current content
    container.innerHTML = "";

    if (!text && !isFocused) {
      // Show placeholder
      container.innerHTML = `<span class="text-muted-foreground pointer-events-none">${
        placeholder || ""
      }</span>`;
      return;
    }

    // Match template patterns: {{@nodeId:DisplayName.field}} or {{@nodeId:DisplayName}}
    const pattern = /\{\{@([^:]+):([^}]+)\}\}/g;
    let lastIndex = 0;
    let match;

    // biome-ignore lint/suspicious/noAssignInExpressions: pattern.exec() is standard
    while ((match = pattern.exec(text)) !== null) {
      const [fullMatch] = match;
      const matchStart = match.index;

      // Add text before the template (preserving line breaks)
      if (matchStart > lastIndex) {
        const textBefore = text.slice(lastIndex, matchStart);
        addTextWithLineBreaks(container, textBefore);
      }

      // Create badge for template
      const badge = document.createElement("span");
      const nodeExists = doesNodeExist(fullMatch, nodes);
      badge.className = nodeExists
        ? "inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600 dark:text-blue-400 font-mono text-xs border border-blue-500/20 mx-0.5"
        : "inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-red-600 dark:text-red-400 font-mono text-xs border border-red-500/20 mx-0.5";
      badge.contentEditable = "false";
      badge.setAttribute("data-template", fullMatch);
      // Use current node label for display
      badge.textContent = getDisplayTextForTemplate(fullMatch, nodes);
      container.appendChild(badge);

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.slice(lastIndex);
      addTextWithLineBreaks(container, textAfter);
    }

    // If empty and focused, ensure we can type
    if (container.innerHTML === "" && isFocused) {
      container.innerHTML = "<br>";
    }

    shouldUpdateDisplay.current = false;

    // Restore cursor position after updating
    if (cursorPos) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => restoreCursorPosition(cursorPos));
    }
  }, [internalValue, isFocused, nodes, placeholder]);

  const handleInput = () => {
    // Extract the value from DOM
    const newValue = extractValue();

    console.log("[Textarea] handleInput: newValue:", newValue);
    console.log("[Textarea] handleInput: internalValue:", internalValue);
    console.log(
      "[Textarea] handleInput: DOM innerHTML:",
      contentRef.current?.innerHTML
    );

    // Check if the value has changed
    if (newValue === internalValue) {
      // No change, ignore (this can happen with badge clicks, etc)
      console.log("[Textarea] handleInput: No change detected, ignoring");
      return;
    }

    // Count templates in old and new values
    const oldTemplates = (
      internalValue.match(/\{\{@([^:]+):([^}]+)\}\}/g) || []
    ).length;
    const newTemplates = (newValue.match(/\{\{@([^:]+):([^}]+)\}\}/g) || [])
      .length;

    console.log(
      "[Textarea] handleInput: oldTemplates:",
      oldTemplates,
      "newTemplates:",
      newTemplates
    );

    if (newTemplates > oldTemplates) {
      // A new template was added, update display to show badge
      console.log("[Textarea] handleInput: New template added, rendering badge");
      setInternalValue(newValue);
      onChange?.(newValue);
      shouldUpdateDisplay.current = true;
      setShowAutocomplete(false);

      // Call updateDisplay immediately to render badges
      requestAnimationFrame(() => updateDisplay());
      return;
    }

    if (newTemplates === oldTemplates && newTemplates > 0) {
      // Same number of templates, just typing around existing badges
      // DON'T update display, just update the value
      console.log(
        "[Textarea] handleInput: Typing around existing badges, NOT updating display"
      );
      setInternalValue(newValue);
      onChange?.(newValue);
      // Don't trigger display update - this prevents cursor reset!

      // Check for @ sign to show autocomplete (moved here so it works with existing badges)
      const lastAtSign = newValue.lastIndexOf("@");

      if (lastAtSign !== -1) {
        const filter = newValue.slice(lastAtSign + 1);

        if (!filter.includes(" ") && !filter.includes("\n")) {
          setAutocompleteFilter(filter);
          setAtSignPosition(lastAtSign);

          if (contentRef.current) {
            const textareaRect = contentRef.current.getBoundingClientRect();
            const position = {
              top: textareaRect.bottom + window.scrollY + 4,
              left: textareaRect.left + window.scrollX,
            };
            setAutocompletePosition(position);
          }
          setShowAutocomplete(true);
        } else {
          setShowAutocomplete(false);
        }
      } else {
        setShowAutocomplete(false);
      }

      return;
    }

    if (newTemplates < oldTemplates) {
      // A template was removed (e.g., user deleted a badge or part of template text)
      console.log("[Textarea] handleInput: Template removed, updating display");
      setInternalValue(newValue);
      onChange?.(newValue);
      shouldUpdateDisplay.current = true;
      requestAnimationFrame(() => updateDisplay());
      return;
    }

    // Normal typing (no badges present)
    console.log("[Textarea] handleInput: Normal typing, no badges");
    setInternalValue(newValue);
    onChange?.(newValue);

    // Check for @ sign to show autocomplete
    const lastAtSign = newValue.lastIndexOf("@");

    if (lastAtSign !== -1) {
      const filter = newValue.slice(lastAtSign + 1);

      if (!filter.includes(" ") && !filter.includes("\n")) {
        setAutocompleteFilter(filter);
        setAtSignPosition(lastAtSign);

        if (contentRef.current) {
          const textareaRect = contentRef.current.getBoundingClientRect();
          const position = {
            top: textareaRect.bottom + window.scrollY + 4,
            left: textareaRect.left + window.scrollX,
          };
          setAutocompletePosition(position);
        }
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (template: string) => {
    if (!contentRef.current || atSignPosition === null) return;

    // Get current text
    const currentText = extractValue();

    // Replace from @ position to end of filter with the template
    const beforeAt = currentText.slice(0, atSignPosition);
    const afterFilter = currentText.slice(
      atSignPosition + 1 + autocompleteFilter.length
    );
    const newText = beforeAt + template + afterFilter;

    // Calculate where cursor should be after the template (right after the badge)
    const targetCursorPosition = beforeAt.length + template.length;

    console.log("[Textarea] Autocomplete select:", {
      currentText,
      atSignPosition,
      filter: autocompleteFilter,
      template,
      beforeAt,
      afterFilter,
      newText,
      targetCursorPosition,
    });

    setInternalValue(newText);
    onChange?.(newText);
    shouldUpdateDisplay.current = true;

    setShowAutocomplete(false);
    setAtSignPosition(null);

    // Set pending cursor position for the next update
    pendingCursorPosition.current = targetCursorPosition;

    // Ensure we focus the input so the display update and cursor restoration works
    contentRef.current.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    shouldUpdateDisplay.current = true;
  };

  const handleBlur = () => {
    // Delay to allow autocomplete click to register
    setTimeout(() => {
      if (document.activeElement === contentRef.current) {
        return;
      }
      setIsFocused(false);
      // Don't extract value on blur - it's already in sync from handleInput
      // Just trigger a display update to ensure everything renders correctly
      shouldUpdateDisplay.current = true;
      setShowAutocomplete(false);
    }, 200);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to insert line breaks
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  };

  // Update display only when needed (not while typing)
  useEffect(() => {
    if (shouldUpdateDisplay.current) {
      updateDisplay();
    }
  }, [internalValue, isFocused, updateDisplay]);

  // Calculate min height based on rows
  const minHeight = `${rows * 1.5}rem`;

  return (
    <>
      <div
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        style={{ minHeight }}
      >
        <div
          className="w-full outline-none whitespace-pre-wrap break-words"
          contentEditable={!disabled}
          id={id}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          ref={contentRef}
          role="textbox"
          suppressContentEditableWarning
        />
      </div>

      <TemplateAutocomplete
        currentNodeId={selectedNodeId || undefined}
        filter={autocompleteFilter}
        isOpen={showAutocomplete}
        onClose={() => setShowAutocomplete(false)}
        onSelect={handleAutocompleteSelect}
        position={autocompletePosition}
      />
    </>
  );
}
