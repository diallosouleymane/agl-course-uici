'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramViewerProps {
  diagram: string;
  id?: string;
}

export function DiagramViewer({ diagram, id = 'mermaid-diagram' }: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = diagram;
      mermaid.run({
        querySelector: '.mermaid',
      });
    }
  }, [diagram]);

  return (
    <div className="bg-white p-6 rounded-lg border overflow-auto">
      <div ref={containerRef} className="mermaid">
        {diagram}
      </div>
    </div>
  );
}
