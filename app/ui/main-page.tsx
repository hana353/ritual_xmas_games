'use client';

import React, { useEffect, useState } from "react";
import { DraggableItem, TreeState } from "@/app/lib/definitions";
import { DraggableEvent } from "react-draggable";
import { DraggableData, Position, ResizableDelta } from "react-rnd";
import { ResizeDirection } from "re-resizable";
import { toPng } from "html-to-image";
import DecorItem from "@/app/ui/decor-item";
import { toast, ToastContainer } from "react-toastify";
import DecorBox from "@/app/ui/decor-box";
import ExportModal from "@/app/ui/export-modal";
import CapturingModal from "@/app/ui/capturing-modal";
import GuideModal from "@/app/ui/guide-modal";
import Snowfall from "react-snowfall";
import { prefix } from "@/app/lib/prefix";

export default function MainPage({
  treeLinks,
  itemLinks,
  petLinks,
  ribbonLinks,
  backgroundLinks,
  siggyLinks,
}: {
  treeLinks: string[],
  itemLinks: string[],
  petLinks: string[],
  ribbonLinks: string[],
  backgroundLinks: string[],
  siggyLinks: string[],
}) {
  // Node refs
  const exportNodeRef = React.useRef<HTMLDivElement>(null);
  const treeMenuRef = React.useRef<HTMLDivElement>(null);

  // State
  const [selectedMenu, setSelectedMenu] = useState<'trees' | 'pets' | 'ribbons' | 'items' | 'backgrounds' | 'siggy'>('trees');
  const [currentTrees, setCurrentTrees] = useState<TreeState[]>([]);
  const [treeNextId, setTreeNextId] = useState(0);
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string[]>([]);
  const [treeSubMenu, setTreeSubMenu] = useState<string[]>([]);
  const [decorItems, setDecorItems] = useState<DraggableItem[]>([]);
  const [nextId, setNextId] = useState(0);
  const [touchExpiration, setTouchExpiration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Handle saved session
  useEffect(() => {
    const savedTreesJson = localStorage.getItem("currentTrees");
    if (savedTreesJson) {
      try {
        const savedTrees = JSON.parse(savedTreesJson) as TreeState[];
        setCurrentTrees(savedTrees);
        if (savedTrees.length > 0) {
          const maxId = Math.max(...savedTrees.map(t => t.id), -1);
          setTreeNextId(maxId + 1);
        }
      } catch {
        setCurrentTrees([]);
      }
    }
    setCurrentBackground(localStorage.getItem("currentBackground") || null);

    const savedDecorItemsJson = localStorage.getItem("currentItems") || "[]";
    const savedDecorItems = JSON.parse(savedDecorItemsJson) as Array<DraggableItem>;
    setDecorItems(savedDecorItems);

    const lastSavedItem = savedDecorItems && savedDecorItems[-1];
    if (lastSavedItem) {
      setNextId(lastSavedItem.id + 1);
    }
  }, []);

  useEffect(() => {
    switch (selectedMenu) {
      case "trees": setCurrentMenu(treeLinks); break;
      case "pets": setCurrentMenu(petLinks); break;
      case "ribbons": setCurrentMenu(ribbonLinks); break;
      case "items": setCurrentMenu(itemLinks); break;
      case "backgrounds": setCurrentMenu(backgroundLinks); break;
      case "siggy": setCurrentMenu(siggyLinks); break;
    }
  }, [selectedMenu]);

  function handleRotate(id: number, delta: number) {
  setDecorItems(decorItems.map(item => {
    if (item.id === id) {
      return { ...item, rotation: (item.rotation + delta) % 360 };
    }
    return item;
  }));
}

// Cập nhật hàm addDecorItem để thêm rotation mặc định:
function addDecorItem(imgLink: string) {
  const newDecorItem: DraggableItem = {
    id: nextId,
    imageSrc: imgLink,
    x: 0, y: 0,
    width: 200, height: 200,
    rotation: 0 // Thêm rotation mặc định
  };
  setDecorItems([...decorItems, newDecorItem]);
  setNextId(nextId + 1);
}

// Function to add tree (allows multiple trees)
function addTree(imgLink: string) {
  const newTree: TreeState = {
    id: treeNextId,
    imageSrc: imgLink,
    x: 0, y: 0,
    width: 300, height: 400,
    rotation: 0
  };
  setCurrentTrees([...currentTrees, newTree]);
  setTreeNextId(treeNextId + 1);
}

  function deleteDecorItem(e: React.MouseEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const itemId = img.getAttribute('data-item-id');
    const modifiedId = itemId ? Number(itemId) : (img.id.startsWith('decor-item-') ? Number(img.id.replace('decor-item-', '')) : Number(img.id));
    setDecorItems(decorItems.filter(item => item.id !== modifiedId));
  }

  function deleteItemOnDoubleTouch(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 1) {
      const img = e.currentTarget;
      const itemId = img.getAttribute('data-item-id');
      const modifiedId = itemId ? Number(itemId) : (img.id.startsWith('decor-item-') ? Number(img.id.replace('decor-item-', '')) : Number(img.id));
      
      if (!touchExpiration) {
        setTouchExpiration(e.timeStamp + 400);
      } else if (e.timeStamp <= touchExpiration) {
        // Reset for other double touch events
        setDecorItems(decorItems.filter(item => item.id !== modifiedId));
        setTouchExpiration(0);
      } else {
        // Second touch expired
        setTouchExpiration(e.timeStamp + 400);
      }
    }
  }

  function handleDragStop(e: DraggableEvent, data: DraggableData) {
    const imgNode = data.node.querySelector("img");
    if (!imgNode) return;
    
    // Get item ID from data attribute or parse from id
    const itemId = imgNode.getAttribute('data-item-id');
    const modifiedId = itemId ? Number(itemId) : (imgNode.id.startsWith('decor-item-') ? Number(imgNode.id.replace('decor-item-', '')) : Number(imgNode.id));

    setDecorItems(decorItems.map(item => {
      if (item.id === modifiedId) {
        return { ...item, x: data.x, y: data.y };
      } else {
        return item;
      }
    }));
  }

  function handleResizeStop(e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
    const imgNode = ref.querySelector("img");
    if (!imgNode) return;
    
    // Get item ID from data attribute or parse from id
    const itemId = imgNode.getAttribute('data-item-id');
    const modifiedId = itemId ? Number(itemId) : (imgNode.id.startsWith('decor-item-') ? Number(imgNode.id.replace('decor-item-', '')) : Number(imgNode.id));

    setDecorItems(decorItems.map(item => {
      if (item.id === modifiedId) {
        return { ...item, ...position, width: ref.offsetWidth, height: ref.offsetHeight };
      } else {
        return item;
      }
    }));
  }

  function handleResize(id: number, width: number, height: number) {
    setDecorItems(decorItems.map(item => {
      if (item.id === id) {
        return { ...item, width, height };
      } else {
        return item;
      }
    }));
  }

  // Tree handlers - work with tree id
  function handleTreeDragStop(id: number, e: DraggableEvent, data: DraggableData) {
    setCurrentTrees(currentTrees.map(tree => 
      tree.id === id ? { ...tree, x: data.x, y: data.y } : tree
    ));
  }

  function handleTreeResizeStop(id: number, e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
    setCurrentTrees(currentTrees.map(tree => 
      tree.id === id ? { 
        ...tree, 
        ...position, 
        width: ref.offsetWidth, 
        height: ref.offsetHeight 
      } : tree
    ));
  }

  function handleTreeRotate(id: number, delta: number) {
    setCurrentTrees(currentTrees.map(tree => 
      tree.id === id ? { ...tree, rotation: (tree.rotation + delta) % 360 } : tree
    ));
  }

  function handleTreeResize(id: number, width: number, height: number) {
    setCurrentTrees(currentTrees.map(tree => 
      tree.id === id ? { ...tree, width, height } : tree
    ));
  }

  function handleDeleteTree(id: number) {
    setCurrentTrees(currentTrees.filter(tree => tree.id !== id));
  }

  // Function to handle double-touch on mobile for deleting trees
  function deleteTreeOnDoubleTouch(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 1) {
      const img = e.currentTarget;
      const treeId = img.getAttribute('data-tree-id');
      const modifiedId = treeId ? Number(treeId) : (img.id.startsWith('tree-') ? Number(img.id.replace('tree-', '')) : -1);
      
      if (modifiedId === -1) return;
      
      if (!touchExpiration) {
        setTouchExpiration(e.timeStamp + 400);
      } else if (e.timeStamp <= touchExpiration) {
        // Double touch detected - delete tree
        handleDeleteTree(modifiedId);
        setTouchExpiration(0);
      } else {
        // Second touch expired
        setTouchExpiration(e.timeStamp + 400);
      }
    }
  }

  function handleSave() {
    if (currentTrees.length > 0) {
      localStorage.setItem("currentTrees", JSON.stringify(currentTrees));
    } else {
      localStorage.removeItem("currentTrees");
    }
    localStorage.setItem("currentItems", JSON.stringify(decorItems));
    if (currentBackground) {
      localStorage.setItem("currentBackground", currentBackground);
    } else {
      localStorage.removeItem("currentBackground");
    }
    toast("Saved decoration successfully");
  }

  function handleClear() {
    // Reset to default state
    setDecorItems([]);
    setCurrentTrees([]);
    setTreeNextId(0);
    setCurrentBackground(null);
    setNextId(0);
    setTreeSubMenu([]);
    
    // Clear localStorage
    localStorage.removeItem("currentTrees");
    localStorage.removeItem("currentItems");
    localStorage.removeItem("currentBackground");
    
toast.success("All decorations cleared, reverted to default");
  }

  async function handleExport() {
    // CRITICAL FIX: Clear previous export completely before starting new one
    setExportedImageUrl(null);
    setExportModalOpen(false);
    
    // Reduced delay - only wait for state to update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force clear Next.js Image cache by reloading all images (optimized)
    if (exportNodeRef.current) {
      const allImages = Array.from(exportNodeRef.current.querySelectorAll('img')) as HTMLImageElement[];
      const reloadPromises: Promise<void>[] = [];
      const treeSrcs = currentTrees.map(t => t.imageSrc);
      const expectedTreeSrcs = treeSrcs.map(src => `${prefix}/${src}`);
      
      for (const img of allImages) {
        const itemId = img.getAttribute('data-item-id');
        const expectedSrc = img.getAttribute('data-image-src');
        
        // Check if this is tree image (no data-item-id, but src matches any tree)
        const isTreeImage = !itemId && (treeSrcs.some(treeSrc => img.src.includes(treeSrc)) || img.alt === 'Decoration tree');
        
        if (isTreeImage) {
          // Find matching tree src
          const matchingTreeSrc = treeSrcs.find(treeSrc => img.src.includes(treeSrc)) || treeSrcs[0];
          const expectedTreeSrc = `${prefix}/${matchingTreeSrc}`;
          // Force reload tree image with cache busting
          const cacheBuster = `?cb=${Date.now()}-tree`;
          const treeSrcWithCacheBuster = expectedTreeSrc + cacheBuster;
          const reloadPromise = new Promise<void>((resolve) => {
            img.src = treeSrcWithCacheBuster;
            setTimeout(() => {
              img.src = expectedTreeSrc;
              // Wait for tree image to load
              if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                resolve();
              } else {
                const onLoad = () => {
                  img.removeEventListener('load', onLoad);
                  img.removeEventListener('error', onError);
                  resolve();
                };
                const onError = () => {
                  img.removeEventListener('load', onLoad);
                  img.removeEventListener('error', onError);
                  resolve();
                };
                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
                setTimeout(() => resolve(), 2000);
              }
            }, 50);
          });
          reloadPromises.push(reloadPromise);
        } else if (itemId && expectedSrc && itemId.trim() !== '' && expectedSrc.trim() !== '') {
          // Reload decoration items
          const fullExpectedSrc = `${prefix}/${expectedSrc}`;
          // Add cache busting parameter to force reload
          const cacheBuster = `?cb=${Date.now()}`;
          // Temporarily change src to force reload
          const currentSrc = img.src;
          if (currentSrc !== fullExpectedSrc + cacheBuster) {
            img.src = fullExpectedSrc + cacheBuster;
            // Wait a bit then restore to normal src (without cache buster for export)
            const reloadPromise = new Promise<void>((resolve) => {
              setTimeout(() => {
                img.src = fullExpectedSrc;
                resolve();
              }, 30); // Reduced from 50ms
            });
            reloadPromises.push(reloadPromise);
          }
        }
      }
      // Wait for all reloads to complete (parallel instead of sequential)
      if (reloadPromises.length > 0) {
        await Promise.all(reloadPromises);
      }
      // Reduced wait time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const dataUrl = await exportImageToDataUrl();
    
    if (dataUrl) {
      // Set the new image and open modal immediately - no additional delay
      setExportedImageUrl(dataUrl);
      setExportModalOpen(true);
      // Image will load in modal, no need to wait
      toast.success('Image ready!');
    }
  }

  async function handleSaveImage() {
    if (!exportedImageUrl) return;
    setIsSavingImage(true);

    try {
      const link = document.createElement('a');
      link.download = `xmas-decorate-${Date.now()}.png`;
      link.href = exportedImageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image saved successfully!');
      setExportModalOpen(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to save image');
    } finally {
      setIsSavingImage(false);
    }
  }

  async function handleCopyImage() {
    if (!exportedImageUrl) return;
    setIsCopyingImage(true);

    try {
      const response = await fetch(exportedImageUrl);
      const blob = await response.blob();

      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast.success('Image copied to clipboard!');
      } else {
        toast.warning('Copy not supported on this browser');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy image');
    } finally {
      setIsCopyingImage(false);
    }
  }

  async function exportImageToDataUrl(): Promise<string | null> {
    if (!exportNodeRef.current || isExporting) return null;

    setIsExporting(true);
    const node = exportNodeRef.current;
    const parentContainer = node.parentElement;

    // Store original styles
    const originalOverflow = parentContainer ? window.getComputedStyle(parentContainer).overflow : '';
    const originalPosition = window.getComputedStyle(node).position;
    const originalVisibility = window.getComputedStyle(node).visibility;
    const originalOpacity = window.getComputedStyle(node).opacity;
    
    const originalInlineOverflow = parentContainer?.style.overflow || '';
    const originalInlinePosition = node.style.position || '';
    const originalInlineVisibility = node.style.visibility || '';
    const originalInlineOpacity = node.style.opacity || '';
    
    const parentClasses = parentContainer?.className || '';
    
    // Reset node to clean state
    node.style.visibility = 'visible';
    node.style.opacity = '1';
    node.style.position = 'relative';
    node.style.transform = 'none';
    
    void node.offsetWidth;

    try {
      if (parentContainer) {
        parentContainer.className = parentContainer.className.replace(/\boverflow-hidden\b/g, '');
        parentContainer.style.setProperty('overflow', 'visible', 'important');
      }
      
      void node.offsetWidth;
      void node.offsetHeight;
      void node.offsetWidth;

      // Wait for ALL images to load properly - increased reliability for mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let allImagesLoaded = false;
      let attempts = 0;
      const maxAttempts = isMobile ? 12 : 8; // Increased for mobile reliability

      while (!allImagesLoaded && attempts < maxAttempts) {
        const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
        
        if (imgs.length === 0) {
          await new Promise(resolve => setTimeout(resolve, isMobile ? 400 : 200));
          attempts++;
          continue;
        }

        const imgLoadPromises = imgs.map(img => {
          return new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              console.warn('Image load timeout:', img.src);
              resolve();
            }, isMobile ? 10000 : 8000); // Increased timeout for mobile reliability

            if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
              clearTimeout(timeout);
              resolve();
            } else {
              const onLoad = () => {
                clearTimeout(timeout);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                resolve();
              };
              const onError = () => {
                clearTimeout(timeout);
                console.warn('Image failed to load:', img.src);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                resolve();
              };
              img.addEventListener('load', onLoad, { once: true });
              img.addEventListener('error', onError, { once: true });

              // On mobile, ensure image is actually loading (optimized)
              if (!img.complete && isMobile) {
                // Skip preload check to speed up - images should already be in cache
                // Just wait for natural load
              }
            }
          });
        });

        await Promise.all(imgLoadPromises);
        
        // More strict check - all images must be fully loaded
        const allLoaded = imgs.every(img => {
          const isLoaded = img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
          if (!isLoaded && isMobile) {
            console.log('Image not loaded:', {
              src: img.src,
              complete: img.complete,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
          }
          return isLoaded;
        });
        
        if (allLoaded) {
          allImagesLoaded = true;
        } else {
          attempts++;
          // Increased delay for mobile reliability
          await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 300));
        }
      }

      // Wait for Rnd components - increased for mobile reliability
      await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 300));

      // Wait for fonts - optimized timeout
      if ((document as any).fonts?.ready) {
        try {
          await Promise.race([
            (document as any).fonts.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Font timeout')), isMobile ? 2000 : 1500))
          ]);
        } catch (err) {
          console.warn('Font loading timeout or failed', err);
        }
      }

      // Increased delay to ensure ALL decoration items are fully rendered - critical for mobile
      await new Promise(resolve => setTimeout(resolve, isMobile ? 1200 : 600));

      void node.offsetWidth;
      void node.offsetHeight;

      // CRITICAL FIX: Verify all images have correct src and are fully loaded
      // Don't reset src as it causes Next.js Image cache issues where items get replaced with tree
      const allImages = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
      const imageSrcs = new Map<string, { expected: string; current: string }>();
      const treeSrcsForExport = currentTrees.map(t => t.imageSrc);
      const expectedTreeSrcs = treeSrcsForExport.map(src => `${prefix}/${src}`);
      
       // Store expected srcs from data attributes to verify they don't change
       // Check both decoration items and tree images
       for (const img of allImages) {
         const itemId = img.getAttribute('data-item-id');
         const expectedSrc = img.getAttribute('data-image-src');
         const isTreeImage = !itemId && (treeSrcsForExport.some(treeSrc => img.src.includes(treeSrc)) || img.alt === 'Decoration tree');
         
         // Verify tree image first
         if (isTreeImage) {
           const currentSrc = img.src || '';
           const matchingTreeSrc = treeSrcsForExport.find(treeSrc => img.src.includes(treeSrc));
           const expectedTreeSrc = matchingTreeSrc ? `${prefix}/${matchingTreeSrc}` : '';
           const treeSrcCorrect = matchingTreeSrc && (currentSrc.includes(matchingTreeSrc) || 
                                 currentSrc === expectedTreeSrc ||
                                 currentSrc.includes(encodeURIComponent(matchingTreeSrc)));
           
           if (!treeSrcCorrect || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
             console.warn('Tree image not correct or not loaded, fixing...', {
               expected: expectedTreeSrc,
               current: currentSrc,
               complete: img.complete,
               naturalWidth: img.naturalWidth,
               naturalHeight: img.naturalHeight
             });
             // Force reload tree image
             const cacheBuster = `?cb=${Date.now()}-tree`;
             img.src = expectedTreeSrc + cacheBuster;
             await new Promise(resolve => setTimeout(resolve, 100));
             img.src = expectedTreeSrc;
             await new Promise<void>((resolve) => {
               if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                 resolve();
               } else {
                 const onLoad = () => {
                   img.removeEventListener('load', onLoad);
                   img.removeEventListener('error', onError);
                   resolve();
                 };
                 const onError = () => {
                   img.removeEventListener('load', onLoad);
                   img.removeEventListener('error', onError);
                   resolve();
                 };
                 img.addEventListener('load', onLoad, { once: true });
                 img.addEventListener('error', onError, { once: true });
                 setTimeout(() => resolve(), 2000);
               }
             });
           }
         } else if (itemId && expectedSrc && itemId.trim() !== '' && expectedSrc.trim() !== '') {
           // Only process decoration items with valid data attributes
           const fullExpectedSrc = `${prefix}/${expectedSrc}`;
           imageSrcs.set(itemId, { expected: fullExpectedSrc, current: img.src });
           
           // Verify image is loaded and has correct dimensions
           if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
             console.warn('Image not fully loaded:', {
               itemId,
               expectedSrc: fullExpectedSrc,
               currentSrc: img.src,
               complete: img.complete,
               naturalWidth: img.naturalWidth,
               naturalHeight: img.naturalHeight
             });
           }
           
           // Check if src matches expected (handle both full URL and relative path)
           const currentSrc = img.src || '';
           const srcMatches = currentSrc.includes(expectedSrc) || 
                             currentSrc.includes(encodeURIComponent(expectedSrc)) ||
                             currentSrc.endsWith(expectedSrc) ||
                             currentSrc === fullExpectedSrc;
           
           // Only log and fix if there's a real mismatch
           if (!srcMatches && currentSrc !== '') {
             console.warn('Image src mismatch detected, fixing...', {
               itemId: itemId || 'unknown',
               expected: fullExpectedSrc,
               current: currentSrc,
               expectedSrc: expectedSrc
             });
             // Force reload with correct src and wait for it to load
             // Add cache busting to prevent Next.js Image cache issues
             const cacheBuster = `?cb=${Date.now()}-${itemId}`;
             const srcWithCacheBuster = fullExpectedSrc + cacheBuster;
             
             // First, set src with cache buster to force reload
             img.src = srcWithCacheBuster;
             
             // Wait for image to actually load after src change
             await new Promise<void>((resolve) => {
               if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                 // Image loaded, now set to final src without cache buster
                 img.src = fullExpectedSrc;
                 resolve();
               } else {
                 const onLoad = () => {
                   img.removeEventListener('load', onLoad);
                   img.removeEventListener('error', onError);
                   // Image loaded, now set to final src without cache buster
                   img.src = fullExpectedSrc;
                   resolve();
                 };
                 const onError = () => {
                   console.warn('Failed to reload image:', fullExpectedSrc);
                   img.removeEventListener('load', onLoad);
                   img.removeEventListener('error', onError);
                   // Try setting to final src anyway
                   img.src = fullExpectedSrc;
                   resolve();
                 };
                 img.addEventListener('load', onLoad, { once: true });
                 img.addEventListener('error', onError, { once: true });
                 
                 // Timeout after 3 seconds
                 setTimeout(() => {
                   img.removeEventListener('load', onLoad);
                   img.removeEventListener('error', onError);
                   // Set to final src on timeout
                   img.src = fullExpectedSrc;
                   resolve();
                 }, 3000);
               }
             });
             
             // Additional wait to ensure image is fully rendered with correct src
             await new Promise(resolve => setTimeout(resolve, isMobile ? 400 : 300));
           }
         }
         // Skip images without data attributes (like tree background) - they're fine
       }
      
      // Wait for final render and verify srcs haven't changed - increased for mobile reliability
      await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 400));
      
      // Final verification before export - restore any incorrect srcs with proper loading
      let needsReload = false;
      let reloadCount = 0;
      const maxReloadAttempts = isMobile ? 5 : 3; // Increased attempts for mobile reliability
      
      while (reloadCount < maxReloadAttempts) {
        needsReload = false;
        const reloadPromises: Promise<void>[] = [];
        
        for (const img of allImages) {
          const itemId = img.getAttribute('data-item-id');
          const expectedSrc = img.getAttribute('data-image-src');
          const isTreeImage = !itemId && (treeSrcsForExport.some(treeSrc => img.src.includes(treeSrc)) || img.alt === 'Decoration tree');
          
          // Verify tree image
          if (isTreeImage) {
            const currentSrc = img.src || '';
            const matchingTreeSrc = treeSrcsForExport.find(treeSrc => img.src.includes(treeSrc));
            const expectedTreeSrc = matchingTreeSrc ? `${prefix}/${matchingTreeSrc}` : '';
            const treeSrcCorrect = matchingTreeSrc && (currentSrc.includes(matchingTreeSrc) || 
                                  currentSrc === expectedTreeSrc ||
                                  currentSrc.includes(encodeURIComponent(matchingTreeSrc)));
            const isLoaded = img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
            
            if (!isLoaded || !treeSrcCorrect) {
              if (!treeSrcCorrect && currentSrc !== '' && matchingTreeSrc) {
                console.warn('Tree image src changed during export! Restoring...', {
                  expected: expectedTreeSrc,
                  current: currentSrc
                });
                // Force restore correct tree src
                const cacheBuster = `?cb=${Date.now()}-tree`;
                const expectedWithCacheBuster = expectedTreeSrc + cacheBuster;
                
                const reloadPromise = new Promise<void>((resolve) => {
                  img.src = expectedWithCacheBuster;
                  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    img.src = expectedTreeSrc;
                    resolve();
                  } else {
                    const onLoad = () => {
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      img.src = expectedTreeSrc;
                      resolve();
                    };
                    const onError = () => {
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      img.src = expectedTreeSrc;
                      resolve();
                    };
                    img.addEventListener('load', onLoad, { once: true });
                    img.addEventListener('error', onError, { once: true });
                    setTimeout(() => {
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      img.src = expectedTreeSrc;
                      resolve();
                    }, 3000);
                  }
                });
                reloadPromises.push(reloadPromise);
              }
              needsReload = true;
            }
          } else if (itemId && expectedSrc && itemId.trim() !== '' && expectedSrc.trim() !== '' && imageSrcs.has(itemId)) {
            // Only process images with valid data attributes
            const { expected } = imageSrcs.get(itemId)!;
            // Check if image is loaded AND src is correct
            const isLoaded = img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
            const currentSrc = img.src || '';
            const srcCorrect = currentSrc.includes(expectedSrc) || 
                              currentSrc.includes(encodeURIComponent(expectedSrc)) ||
                              currentSrc.endsWith(expectedSrc) ||
                              currentSrc === expected;
            
            if (!isLoaded || !srcCorrect) {
              if (!srcCorrect && currentSrc !== '') {
                console.warn('Image src changed during export! Restoring...', {
                  itemId: itemId || 'unknown',
                  expected: expected || 'unknown',
                  current: currentSrc || 'empty',
                  expectedSrc: expectedSrc || 'unknown'
                });
                // Force restore correct src and wait for it to load
                // Add cache busting to prevent Next.js Image cache issues
                const cacheBuster = `?cb=${Date.now()}-${itemId}`;
                const expectedWithCacheBuster = expected + cacheBuster;
                
                const reloadPromise = new Promise<void>((resolve) => {
                  // First, set src with cache buster to force reload
                  img.src = expectedWithCacheBuster;
                  
                  // Wait for image to actually load after src change
                  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    // Image loaded, now set to final src without cache buster
                    img.src = expected;
                    resolve();
                  } else {
                    const onLoad = () => {
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      // Image loaded, now set to final src without cache buster
                      img.src = expected;
                      resolve();
                    };
                    const onError = () => {
                      console.warn('Failed to reload image during final verification:', expected);
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      // Try setting to final src anyway
                      img.src = expected;
                      resolve();
                    };
                    img.addEventListener('load', onLoad, { once: true });
                    img.addEventListener('error', onError, { once: true });
                    
                    // Timeout after 3 seconds
                    setTimeout(() => {
                      img.removeEventListener('load', onLoad);
                      img.removeEventListener('error', onError);
                      // Set to final src on timeout
                      img.src = expected;
                      resolve();
                    }, 3000);
                  }
                });
                reloadPromises.push(reloadPromise);
              }
              needsReload = true;
            }
          }
        }
        
        // Wait for all reloads to complete
        if (reloadPromises.length > 0) {
          await Promise.all(reloadPromises);
          // Additional wait to ensure images are fully rendered - increased for mobile
          await new Promise(resolve => setTimeout(resolve, isMobile ? 800 : 500));
        }
        
        if (!needsReload) {
          break; // All images are correct
        }
        
        reloadCount++;
        // Wait before re-checking - increased for mobile
        await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 300));
        
        // Re-check all images
        const currentImages = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
        allImages.length = 0;
        allImages.push(...currentImages);
      }
      
      // Final wait after all fixes - increased for mobile reliability
      await new Promise(resolve => setTimeout(resolve, isMobile ? 800 : 500));
      
      // One more comprehensive verification pass to ensure all images are correct and loaded
      const finalImages = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
      let finalNeedsFix = false;
      const finalFixPromises: Promise<void>[] = [];
      
      for (const img of finalImages) {
        const itemId = img.getAttribute('data-item-id');
        const expectedSrc = img.getAttribute('data-image-src');
        const isTreeImage = !itemId && (treeSrcsForExport.some(treeSrc => img.src.includes(treeSrc)) || img.alt === 'Decoration tree');
        
        // Verify tree image in final check
        if (isTreeImage) {
          const currentSrc = img.src || '';
          const matchingTreeSrc = treeSrcsForExport.find(treeSrc => img.src.includes(treeSrc));
          const expectedTreeSrc = matchingTreeSrc ? `${prefix}/${matchingTreeSrc}` : '';
          const treeSrcCorrect = matchingTreeSrc && (currentSrc.includes(matchingTreeSrc) || 
                                currentSrc === expectedTreeSrc ||
                                currentSrc.includes(encodeURIComponent(matchingTreeSrc)));
          const isLoaded = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
          
          if (!treeSrcCorrect || !isLoaded) {
            finalNeedsFix = true;
            const cacheBuster = `?cb=${Date.now()}-tree`;
            const fixPromise = new Promise<void>((resolve) => {
              img.src = expectedTreeSrc + cacheBuster;
              const onLoad = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expectedTreeSrc;
                resolve();
              };
              const onError = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expectedTreeSrc;
                resolve();
              };
              img.addEventListener('load', onLoad, { once: true });
              img.addEventListener('error', onError, { once: true });
              setTimeout(() => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expectedTreeSrc;
                resolve();
              }, 2000);
            });
            finalFixPromises.push(fixPromise);
          }
        } else if (itemId && expectedSrc && itemId.trim() !== '' && expectedSrc.trim() !== '' && imageSrcs.has(itemId)) {
          const { expected } = imageSrcs.get(itemId)!;
          const currentSrc = img.src || '';
          const srcCorrect = currentSrc.includes(expectedSrc) || 
                            currentSrc.includes(encodeURIComponent(expectedSrc)) ||
                            currentSrc.endsWith(expectedSrc) ||
                            currentSrc === expected;
          const isLoaded = img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
          
          if (!srcCorrect && currentSrc !== '') {
            console.warn('Final check: Image src still incorrect, forcing restore:', {
              itemId,
              expected,
              current: currentSrc
            });
            finalNeedsFix = true;
            // Use cache busting to force reload
            const cacheBuster = `?cb=${Date.now()}-${itemId}`;
            const fixPromise = new Promise<void>((resolve) => {
              img.src = expected + cacheBuster;
              const onLoad = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expected;
                resolve();
              };
              const onError = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expected;
                resolve();
              };
              img.addEventListener('load', onLoad, { once: true });
              img.addEventListener('error', onError, { once: true });
              setTimeout(() => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                img.src = expected;
                resolve();
              }, 2000);
            });
            finalFixPromises.push(fixPromise);
          } else if (!isLoaded) {
            // Image src is correct but not loaded yet
            finalNeedsFix = true;
            const waitPromise = new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                resolve();
              } else {
                const onLoad = () => {
                  img.removeEventListener('load', onLoad);
                  img.removeEventListener('error', onError);
                  resolve();
                };
                const onError = () => {
                  img.removeEventListener('load', onLoad);
                  img.removeEventListener('error', onError);
                  resolve();
                };
                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
                setTimeout(() => resolve(), 3000);
              }
            });
            finalFixPromises.push(waitPromise);
          }
        }
      }
      
      // Wait for all final fixes to complete
      if (finalFixPromises.length > 0) {
        await Promise.all(finalFixPromises);
        // Additional wait after final fixes
        await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 400));
      }
      
      // Final wait after last verification - increased for mobile
      await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 400));
      
      // One last check to ensure all images are loaded
      const lastCheckImages = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
      const allFinalLoaded = lastCheckImages.every(img => {
        const itemId = img.getAttribute('data-item-id');
        if (itemId && itemId.trim() !== '') {
          // Only check decoration items
          return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        }
        return true; // Skip tree background
      });
      
      if (!allFinalLoaded && isMobile) {
        // On mobile, wait a bit more if not all loaded
        console.warn('Some images still not fully loaded, waiting a bit more...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Suppress CSS rules SecurityError
      const originalCSSRulesGetter = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'cssRules')?.get;
      if (originalCSSRulesGetter) {
        Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
          get: function() {
            try {
              return originalCSSRulesGetter.call(this);
            } catch (e) {
              const error = e as Error;
              if (error.name === 'SecurityError') {
                console.warn('Skipping cross-origin stylesheet:', this.href);
                return [];
              }
              throw e;
            }
          },
          configurable: true,
        });
      }

      let dataUrl: string;
      try {
        const filter = (node: Node) => {
          if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
            return false;
          }
          return true;
        };

        const nodeWidth = node.clientWidth || node.offsetWidth || 800;
        const nodeHeight = node.clientHeight || node.offsetHeight || 600;
        
        if (nodeWidth === 0 || nodeHeight === 0) {
          throw new Error('Node has invalid dimensions');
        }

        dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2,
          canvasWidth: nodeWidth * 2,
          canvasHeight: nodeHeight * 2,
          backgroundColor: '#0B6E4F',
          filter: filter,
          style: {
            transform: 'scale(1)',
            opacity: '1',
            visibility: 'visible',
          },
        });

        return dataUrl;
      } finally {
        if (originalCSSRulesGetter) {
          Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
            get: originalCSSRulesGetter,
            configurable: true,
          });
        }
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (parentContainer) {
              parentContainer.className = parentClasses;
              if (originalInlineOverflow) {
                parentContainer.style.overflow = originalInlineOverflow;
              } else {
                parentContainer.style.removeProperty('overflow');
              }
            }
            if (originalInlinePosition) {
              node.style.position = originalInlinePosition;
            } else {
              node.style.removeProperty('position');
            }
            if (originalInlineVisibility) {
              node.style.visibility = originalInlineVisibility;
            } else {
              node.style.removeProperty('visibility');
            }
            if (originalInlineOpacity) {
              node.style.opacity = originalInlineOpacity;
            } else {
              node.style.removeProperty('opacity');
            }
            node.style.removeProperty('transform');
          }, 200);
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Capture failed: ${errorMsg}`);
      
      if (parentContainer) {
        parentContainer.className = parentClasses;
        if (originalInlineOverflow) {
          parentContainer.style.overflow = originalInlineOverflow;
        } else {
          parentContainer.style.removeProperty('overflow');
        }
      }
      if (originalInlinePosition) {
        node.style.position = originalInlinePosition;
      } else {
        node.style.removeProperty('position');
      }
      if (originalInlineVisibility) {
        node.style.visibility = originalInlineVisibility;
      } else {
        node.style.removeProperty('visibility');
      }
      if (originalInlineOpacity) {
        node.style.opacity = originalInlineOpacity;
      } else {
        node.style.removeProperty('opacity');
      }
      node.style.removeProperty('transform');
      return null;
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShareToX() {
    try {
      // Always export fresh image before sharing to ensure latest decoration is captured
      const freshImageUrl = await exportImageToDataUrl();
      
      if (!freshImageUrl) {
        throw new Error('Failed to export image');
      }

      const quote = "I'm in for Week 2 of #RitualXmas.\n\nNow it's your turn, Ritualist the holiday magic starts with you.\n\nStep into the magic at ritualxmas.xyz and join our Christmas Decoration Event!\n\nWishing you a peaceful Christmas filled with warmth, light, and a little holiday magic.\n\nMerry Christmas! 🎄\n\n@ritualnet @ritualfnd";
      
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Try Web Share API first, then fallback to Twitter app/web
        try {
          const response = await fetch(freshImageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'xmas-decorate.png', { type: 'image/png' });
          
          // Try Web Share API with file (iOS Safari, Chrome Android)
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My Christmas Decoration',
              text: quote,
              files: [file]
            });
            toast.success('Shared successfully!');
            setExportModalOpen(false);
            return;
          }
        } catch (shareErr) {
          console.log('Web Share API not available or failed, trying Twitter:', shareErr);
        }
        
        // Fallback: Copy to clipboard and open Twitter
        try {
          const response = await fetch(freshImageUrl);
          const blob = await response.blob();
          
          if (navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        } catch (clipboardErr) {
          console.warn('Could not copy image to clipboard:', clipboardErr);
        }
        
        // Open Twitter app or web on mobile
        // Try Twitter app first (twitter://), then web (https://twitter.com)
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`;
        
        // Try to open Twitter app
        const twitterAppUrl = `twitter://post?message=${encodeURIComponent(quote)}`;
        const twitterIntentUrl = `twitter://intent/tweet?text=${encodeURIComponent(quote)}`;
        
        // Try multiple methods to open Twitter on mobile
        let opened = false;
        
        // Method 1: Try Twitter app intent
        try {
          window.location.href = twitterIntentUrl;
          opened = true;
          // Wait a bit to see if it opens
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          // If app doesn't open, continue to web
        }
        
        // Method 2: Open Twitter web if app didn't open
        if (!opened) {
          window.open(tweetUrl, '_blank');
        }
        
        toast.success('X opened! Image copied to clipboard - tap and hold in the tweet box, then paste the image');
        setExportModalOpen(false);
      } else {
        // Desktop: Copy to clipboard and open Twitter web
        try {
          const response = await fetch(freshImageUrl);
          const blob = await response.blob();
          
          if (navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        } catch (clipboardErr) {
          console.warn('Could not copy image to clipboard:', clipboardErr);
        }
        
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`;
        window.open(tweetUrl, '_blank');
        
        toast.success('X opened! Image copied to clipboard - press Ctrl+V to paste into your tweet');
        setExportModalOpen(false);
      }
    } catch (err) {
      console.error('Share failed:', err);
      const quote = "I'm in for Week 2 of #RitualXmas.\n\nNow it's your turn, Ritualist the holiday magic starts with you.\n\nStep into the magic at ritualxmas.xyz and join our Christmas Decoration Event!\n\nWishing you a peaceful Christmas filled with warmth, light, and a little holiday magic.\n\nMerry Christmas! 🎄\n\n@ritualnet @ritualfnd";
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`;
      window.open(tweetUrl, '_blank');
      setExportModalOpen(false);
      toast.info('X opened! Please upload the image manually');
    }
  }

  // REMOVED: decorationVersion tracking - không cần nữa vì mỗi lần export đều tạo mới

  // REMOVED: Auto-export logic - không cần auto export nữa
  // Bây giờ chỉ export khi user bấm "Share to X"

  // Close tree sub-menu when clicking/tapping outside the menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (!treeMenuRef.current) return;
      const target = e.target as Node | null;
      if (target && !treeMenuRef.current.contains(target)) {
        setTreeSubMenu([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Merry Christmas blinking text */}
      <h1 className="blink-red-yellow whitespace-nowrap">Merry Christmas</h1>

      {/* Save, Clear, Guide and share - Christmas themed */}
      <div className="absolute z-20 top-2 right-2 md:top-3 md:right-3 flex flex-wrap gap-1 md:gap-2 max-w-[calc(100%-1rem)]">
        <button
          className="christmas-menu-btn px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm"
          onClick={handleSave}
        >
          💾 <span className="hidden sm:inline">Save</span>
        </button>
        <button
          className="christmas-menu-btn px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm"
          onClick={handleClear}
        >
          🗑️ <span className="hidden sm:inline">Clear</span>
        </button>
        <button
          className="christmas-menu-btn px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm"
          onClick={() => setGuideModalOpen(true)}
        >
          📖 <span className="hidden sm:inline">Guide</span>
        </button>
        <button
          className="christmas-menu-btn active px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '⏳' : '🐦'} <span className="hidden sm:inline">{isExporting ? 'Preparing...' : 'Share to X'}</span>
        </button>
      </div>

      {/* Menu buttons - RIGHT side on desktop, BOTTOM on mobile - Christmas themed */}
      <div className="fixed bottom-0 md:bottom-auto md:top-20 md:right-3 z-10">
        <div className="christmas-menu flex flex-row w-screen justify-center md:flex-col md:w-fit rounded-t-xl md:rounded-xl p-1.5 md:p-2 relative">
          {/* Title - show on both mobile and desktop */}
          <div className="text-center mb-1 md:mb-2 pb-1 md:pb-2 border-b-2 border-yellow-500/50 w-full md:w-auto">
            <span className="text-yellow-400 font-bold text-xs md:text-sm">🎄 MENU 🎄</span>
          </div>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'trees' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('trees')}
            aria-pressed={selectedMenu === 'trees'}
          >
            🎄 <span className="hidden sm:inline">Trees</span>
          </button>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'pets' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('pets')}
            aria-pressed={selectedMenu === 'pets'}
          >
            🐾 <span className="hidden sm:inline">Pets</span>
          </button>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'ribbons' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('ribbons')}
            aria-pressed={selectedMenu === 'ribbons'}
          >
            🎀 <span className="hidden sm:inline">Ribbons</span>
          </button>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'items' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('items')}
            aria-pressed={selectedMenu === 'items'}
          >
            🎁 <span className="hidden sm:inline">Items</span>
          </button>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'backgrounds' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('backgrounds')}
            aria-pressed={selectedMenu === 'backgrounds'}
          >
            🖼️ <span className="hidden sm:inline">BG</span>
          </button>
          <button
            className={`christmas-menu-btn m-0.5 md:m-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm flex-shrink-0 ${selectedMenu === 'siggy' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('siggy')}
            aria-pressed={selectedMenu === 'siggy'}
          >
            ✨ <span className="hidden sm:inline">Siggy</span>
          </button>
        </div>
      </div>

      {/* Item list - LEFT side on desktop - Christmas themed */}
      <div className="fixed top-20 left-0 md:left-3 z-10 hidden md:block">
        <div className="christmas-item-list max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-visible rounded-xl p-3 relative">
          {/* Title */}
          <div className="text-center mb-3 pb-2 border-b-2 border-yellow-500/50">
            <span className="text-yellow-400 font-bold text-sm">
              {selectedMenu === 'trees' && '🎄 TREES 🎄'}
              {selectedMenu === 'pets' && '🐾 PETS 🐾'}
              {selectedMenu === 'ribbons' && '🎀 RIBBONS 🎀'}
              {selectedMenu === 'items' && '🎁 ITEMS 🎁'}
              {selectedMenu === 'backgrounds' && '🖼️ Backgrounds 🖼️'}
              {selectedMenu === 'siggy' && '✨ SIGGY ✨'}
            </span>
          </div>
          
          <div ref={treeMenuRef} className="w-fit">
            {/* Tree menu - showing all 5 trees */}
            <div className="flex flex-col flex-nowrap gap-1">
              {selectedMenu === 'trees' &&
                treeLinks
                  .filter(link => link.endsWith(".1.png"))
                  .map((link, idx) => (
                    <div key={link} className="flex flex-row items-center">
                      <button
                        className={`christmas-item w-16 h-16 m-1 inline-flex items-center justify-center flex-shrink-0 ${currentTrees.some(t => t.imageSrc === link) ? 'selected' : ''}`}
                        onClick={() => {
                          addTree(link);
                          setTreeSubMenu(treeLinks.filter(l => l.startsWith(`trees/${idx + 1}`) && (l.split('/').pop() || l) !== `${idx + 1}.1.png`));
                        }}
                      >
                        <img
                          src={`${prefix}/${link}`}
                          alt="Decoration tree"
                          className="w-12 h-12 object-contain drop-shadow-lg"
                        />
                      </button>
                      {/* Sub menu for tree variants .2 .3 .4 */}
                      {currentTrees.some(t => t.imageSrc === link) && treeSubMenu.length > 0 && (
                        <div className="christmas-submenu flex flex-row items-center rounded-lg ml-2 p-1">
                          {treeSubMenu.map(subLink => (
                            <DecorItem
                              key={subLink}
                              imageSrc={subLink}
                              handleOnClick={() => addDecorItem(subLink)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>

            {/* Item menu - grid layout for better display */}
            {selectedMenu !== 'trees' && (
              <div className="grid grid-cols-2 gap-1">
                {currentMenu.map(link => (
                  <DecorItem
                    key={link}
                    imageSrc={link}
                    isSelected={selectedMenu === 'backgrounds' && currentBackground === link}
                    handleOnClick={() => {
                      if (selectedMenu === 'backgrounds') {
                        setCurrentBackground(link);
                      } else {
                        addDecorItem(link);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile item list - bottom, above menu buttons - Christmas themed */}
      <div className="fixed bottom-20 left-0 right-0 z-10 md:hidden">
        <div className="christmas-item-list max-h-[40vh] overflow-y-auto overflow-x-hidden scrollbar-visible rounded-t-xl mx-2">
          {/* Title for mobile */}
          <div className="text-center py-2 px-2 border-b-2 border-yellow-500/50 sticky top-0 bg-gradient-to-b from-green-900/95 to-green-800/95 z-10">
            <span className="text-yellow-400 font-bold text-xs">
              {selectedMenu === 'trees' && '🎄 TREES 🎄'}
              {selectedMenu === 'pets' && '🐾 PETS 🐾'}
              {selectedMenu === 'ribbons' && '🎀 RIBBONS 🎀'}
              {selectedMenu === 'items' && '🎁 ITEMS 🎁'}
              {selectedMenu === 'backgrounds' && '🖼️ BACKGROUNDS 🖼️'}
              {selectedMenu === 'siggy' && '✨ SIGGY ✨'}
            </span>
          </div>
          <div className="p-2">
            {/* Tree menu for mobile - grid layout */}
            {selectedMenu === 'trees' && (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mb-2">
                  {treeLinks
                    .filter(link => link.endsWith(".1.png"))
                    .map((link, idx) => {
                      const treeSubMenuItems = treeLinks.filter(l => l.startsWith(`trees/${idx + 1}`) && (l.split('/').pop() || l) !== `${idx + 1}.1.png`);
                      return (
                        <button
                          key={link}
                          className={`christmas-item w-full aspect-square inline-flex items-center justify-center ${currentTrees.some(t => t.imageSrc === link) ? 'selected' : ''}`}
                          onClick={() => {
                            addTree(link);
                            setTreeSubMenu(treeSubMenuItems);
                          }}
                        >
                          <img
                            src={`${prefix}/${link}`}
                            alt="Decoration tree"
                            className="w-full h-full object-contain drop-shadow-lg p-1"
                          />
                        </button>
                      );
                    })
                  }
                </div>
                {/* Tree submenu variants on mobile - show below in separate section */}
                {currentTrees.length > 0 && treeSubMenu.length > 0 && (
                  <div className="border-t-2 border-yellow-500/50 pt-2 mt-2">
                    <div className="text-center mb-2">
                      <span className="text-yellow-400 font-bold text-xs">Variants:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {treeSubMenu.map(subLink => (
                        <button
                          key={subLink}
                          className="christmas-item w-full aspect-square inline-flex items-center justify-center"
                          onClick={() => addDecorItem(subLink)}
                        >
                          <img
                            src={`${prefix}/${subLink}`}
                            alt="Tree variant"
                            className="w-full h-full object-contain drop-shadow-lg p-1"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Other items for mobile - grid layout */}
            {selectedMenu !== 'trees' && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {currentMenu.map(link => (
                  <div key={link} className="flex items-center justify-center">
                    <DecorItem
                      imageSrc={link}
                      isSelected={selectedMenu === 'backgrounds' && currentBackground === link}
                      handleOnClick={() => {
                        if (selectedMenu === 'backgrounds') {
                          setCurrentBackground(link);
                        } else {
                          addDecorItem(link);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main decoration canvas - Christmas border - responsive spacing */}
      <div className="w-[calc(100%-20px)] md:w-[100vmin] max-w-3xl aspect-video border-4 border-yellow-500 overflow-hidden absolute top-[190px] md:top-[calc(50px+5rem+30px)] md:left-1/2 md:-translate-x-1/2 md:right-auto md:m-0 left-[10px] right-[10px] m-auto rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,0,0,0.2)]">
        <DecorBox
          trees={currentTrees}
          background={currentBackground}
          decorItems={decorItems}
          exportNodeRef={exportNodeRef}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onDoubleClick={deleteDecorItem}
          onTouchStart={deleteItemOnDoubleTouch}
          onRotate={handleRotate}
          onResize={handleResize}
          onTreeDragStop={handleTreeDragStop}
          onTreeResizeStop={handleTreeResizeStop}
          onTreeRotate={handleTreeRotate}
          onTreeResize={handleTreeResize}
          onTreeDelete={handleDeleteTree}
          onTreeTouchStart={deleteTreeOnDoubleTouch}
        />
      </div>

      <Snowfall />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />

      {/* Export Modal */}
      <CapturingModal isOpen={isExporting} />
      <ExportModal
        isOpen={exportModalOpen}
        imageUrl={exportedImageUrl}
        onClose={() => {
          setExportModalOpen(false);
          // CRITICAL FIX: Clear exported image when closing to force fresh export next time
          setTimeout(() => {
            setExportedImageUrl(null);
          }, 300);
        }}
        onCopy={handleCopyImage}
        onSave={handleSaveImage}
        onShare={handleShareToX}
        isCopying={isCopyingImage}
        isSaving={isSavingImage}
      />
      
      {/* Guide Modal */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
}