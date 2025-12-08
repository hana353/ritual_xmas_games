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
  const [currentTree, setCurrentTree] = useState<TreeState | null>(null);
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
    const savedTreeJson = localStorage.getItem("currentTree");
    if (savedTreeJson) {
      try {
        setCurrentTree(JSON.parse(savedTreeJson) as TreeState);
      } catch {
        setCurrentTree(null);
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

  // Tree handlers
  function handleTreeDragStop(e: DraggableEvent, data: DraggableData) {
    if (!currentTree) return;
    setCurrentTree({ ...currentTree, x: data.x, y: data.y });
  }

  function handleTreeResizeStop(e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
    if (!currentTree) return;
    setCurrentTree({ 
      ...currentTree, 
      ...position, 
      width: ref.offsetWidth, 
      height: ref.offsetHeight 
    });
  }

  function handleTreeRotate(delta: number) {
    if (!currentTree) return;
    setCurrentTree({ ...currentTree, rotation: (currentTree.rotation + delta) % 360 });
  }

  function handleTreeResize(width: number, height: number) {
    if (!currentTree) return;
    setCurrentTree({ ...currentTree, width, height });
  }

  function handleSave() {
    if (currentTree) {
      localStorage.setItem("currentTree", JSON.stringify(currentTree));
    } else {
      localStorage.removeItem("currentTree");
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
    setCurrentTree(null);
    setCurrentBackground(null);
    setNextId(0);
    setTreeSubMenu([]);
    
    // Clear localStorage
    localStorage.removeItem("currentTree");
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
      const treeSrc = currentTree?.imageSrc || '';
      const expectedTreeSrc = `${prefix}/${treeSrc}`;
      
      for (const img of allImages) {
        const itemId = img.getAttribute('data-item-id');
        const expectedSrc = img.getAttribute('data-image-src');
        
        // Check if this is tree image (no data-item-id, but src matches currentTree)
        const isTreeImage = !itemId && (img.src.includes(treeSrc) || img.alt === 'Decoration tree');
        
        if (isTreeImage) {
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
      const treeSrcForExport = currentTree?.imageSrc || '';
      const expectedTreeSrc = `${prefix}/${treeSrcForExport}`;
      
       // Store expected srcs from data attributes to verify they don't change
       // Check both decoration items and tree image
       for (const img of allImages) {
         const itemId = img.getAttribute('data-item-id');
         const expectedSrc = img.getAttribute('data-image-src');
         const isTreeImage = !itemId && (img.src.includes(treeSrcForExport) || img.alt === 'Decoration tree');
         
         // Verify tree image first
         if (isTreeImage) {
           const currentSrc = img.src || '';
           const treeSrcCorrect = currentSrc.includes(treeSrcForExport) || 
                                 currentSrc === expectedTreeSrc ||
                                 currentSrc.includes(encodeURIComponent(treeSrcForExport));
           
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
          const isTreeImage = !itemId && (img.src.includes(treeSrcForExport) || img.alt === 'Decoration tree');
          
          // Verify tree image
          if (isTreeImage) {
            const currentSrc = img.src || '';
            const treeSrcCorrect = currentSrc.includes(treeSrcForExport) || 
                                  currentSrc === expectedTreeSrc ||
                                  currentSrc.includes(encodeURIComponent(treeSrcForExport));
            const isLoaded = img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
            
            if (!isLoaded || !treeSrcCorrect) {
              if (!treeSrcCorrect && currentSrc !== '') {
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
        const isTreeImage = !itemId && (img.src.includes(treeSrcForExport) || img.alt === 'Decoration tree');
        
        // Verify tree image in final check
        if (isTreeImage) {
          const currentSrc = img.src || '';
          const treeSrcCorrect = currentSrc.includes(treeSrcForExport) || 
                                currentSrc === expectedTreeSrc ||
                                currentSrc.includes(encodeURIComponent(treeSrcForExport));
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

      const quote = "I'm in for Week 1 of #RitualXmas\n\nNow it's your turn Ritualist, the holiday magic start with you\n\n Step into the magic at http://ritualxmas.xyz and join our Christmas Decoration Event! ✨\n\n@ritualnet @ritualfnd";
      
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
      const quote = "I'm in for Week 1 of #RitualXmas\n\nNow it's your turn Ritualist, the holiday magic start with you\n\n Step into the magic at http://ritualxmas.xyz and join our Christmas Decoration Event! ✨\n\n@ritualnet @ritualfnd";
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
      <div className="absolute z-20 top-3 right-3 flex gap-2">
        <button
          className="christmas-menu-btn px-3 py-1.5 rounded-lg text-sm"
          onClick={handleSave}
        >
          💾 Save
        </button>
        <button
          className="christmas-menu-btn px-3 py-1.5 rounded-lg text-sm"
          onClick={handleClear}
        >
          🗑️ Clear
        </button>
        <button
          className="christmas-menu-btn px-3 py-1.5 rounded-lg text-sm"
          onClick={() => setGuideModalOpen(true)}
        >
          📖 Guide
        </button>
        <button
          className="christmas-menu-btn active px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '⏳ Preparing...' : '🐦 Share to X'}
        </button>
      </div>

      {/* Menu buttons - RIGHT side on desktop - Christmas themed */}
      <div className="fixed bottom-0 md:bottom-auto md:top-20 md:right-3 z-10">
        <div className="christmas-menu flex flex-row w-screen justify-center md:flex-col md:w-fit rounded-xl p-2 relative">
          {/* Title */}
          <div className="hidden md:block text-center mb-2 pb-2 border-b-2 border-yellow-500/50">
            <span className="text-yellow-400 font-bold text-sm">🎄 MENU 🎄</span>
          </div>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'trees' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('trees')}
            aria-pressed={selectedMenu === 'trees'}
          >
            🎄 Trees
          </button>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'pets' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('pets')}
            aria-pressed={selectedMenu === 'pets'}
          >
            🐾 Pets
          </button>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'ribbons' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('ribbons')}
            aria-pressed={selectedMenu === 'ribbons'}
          >
            🎀 Ribbons
          </button>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'items' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('items')}
            aria-pressed={selectedMenu === 'items'}
          >
            🎁 Items
          </button>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'backgrounds' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('backgrounds')}
            aria-pressed={selectedMenu === 'backgrounds'}
          >
            🖼️ Background
          </button>
          <button
            className={`christmas-menu-btn m-1 px-4 py-2 rounded-lg text-sm ${selectedMenu === 'siggy' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('siggy')}
            aria-pressed={selectedMenu === 'siggy'}
          >
            ✨ Siggy
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
                        className={`christmas-item w-16 h-16 m-1 inline-flex items-center justify-center flex-shrink-0 ${currentTree?.imageSrc === link ? 'selected' : ''}`}
                        onClick={() => {
                          setCurrentTree({
                            imageSrc: link,
                            x: 0, y: 0,
                            width: 300, height: 400,
                            rotation: 0
                          });
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
                      {currentTree?.imageSrc === link && treeSubMenu.length > 0 && (
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
        <div className="christmas-item-list max-h-24 overflow-x-auto overflow-y-hidden scrollbar-visible rounded-t-xl mx-2">
          <div className="flex flex-row whitespace-nowrap p-2 gap-1">
            {/* Tree menu for mobile */}
            {selectedMenu === 'trees' &&
              treeLinks
                .filter(link => link.endsWith(".1.png"))
                .map((link, idx) => (
                  <button
                    key={link}
                    className={`christmas-item w-16 h-16 mx-1 flex-shrink-0 inline-flex items-center justify-center ${currentTree?.imageSrc === link ? 'selected' : ''}`}
                    onClick={() => {
                      setCurrentTree({
                        imageSrc: link,
                        x: 0, y: 0,
                        width: 300, height: 400,
                        rotation: 0
                      });
                    }}
                  >
                    <img
                      src={`${prefix}/${link}`}
                      alt="Decoration tree"
                      className="w-12 h-12 object-contain drop-shadow-lg"
                    />
                  </button>
                ))
            }
            {/* Other items for mobile */}
            {selectedMenu !== 'trees' &&
              currentMenu.map(link => (
                <div key={link} className="flex-shrink-0">
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
              ))
            }
          </div>
        </div>
      </div>

      {/* Main decoration canvas - Christmas border - 30px from bottom */}
      <div className="w-[100vmin] max-w-3xl aspect-video border-4 border-yellow-500 overflow-hidden absolute bottom-[30px] left-0 right-0 m-auto rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,0,0,0.2)]">
        <DecorBox
          tree={currentTree}
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