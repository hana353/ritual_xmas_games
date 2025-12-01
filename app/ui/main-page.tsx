'use client';

import React, { useEffect, useState } from "react";
import { DraggableItem } from "@/app/lib/definitions";
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

export default function MainPage({
  treeLinks,
  itemLinks,
  petLinks,
  ribbonLinks,
}: {
  treeLinks: string[],
  itemLinks: string[],
  petLinks: string[],
  ribbonLinks: string[],
}) {
  // Node refs
  const exportNodeRef = React.useRef<HTMLDivElement>(null);
  const treeMenuRef = React.useRef<HTMLDivElement>(null);

  // State
  const [selectedMenu, setSelectedMenu] = useState<'trees' | 'pets' | 'ribbons' | 'items'>('trees');
  const [currentTree, setCurrentTree] = useState(treeLinks[0] || "");
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
    setCurrentTree(localStorage.getItem("currentTree") || treeLinks[0]);

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
    }
  }, [selectedMenu]);

  function addDecorItem(imgLink: string) {
    const newDecorItem: DraggableItem = {
      id: nextId,
      imageSrc: imgLink,
      x: 0, y: 0,
      width: 200, height: 200
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  function deleteDecorItem(e: React.MouseEvent<HTMLImageElement>) {
    setDecorItems(decorItems.filter(item => item.id !== Number(e.currentTarget.id)));
  }

  function deleteItemOnDoubleTouch(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 1) {
      if (!touchExpiration) {
        setTouchExpiration(e.timeStamp + 400);
      } else if (e.timeStamp <= touchExpiration) {
        // Reset for other double touch events
        setDecorItems(decorItems.filter(item => item.id !== Number(e.currentTarget.id)));
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
    const modifiedId = Number(imgNode.id);

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
    const modifiedId = Number(imgNode.id);

    setDecorItems(decorItems.map(item => {
      if (item.id === modifiedId) {
        return { ...item, ...position, width: ref.offsetWidth, height: ref.offsetHeight };
      } else {
        return item;
      }
    }));
  }

  function handleSave() {
    localStorage.setItem("currentTree", currentTree);
    localStorage.setItem("currentItems", JSON.stringify(decorItems));
    toast("Saved decoration successfully");
  }

  function handleClear() {
    // Reset to default state
    setDecorItems([]);
    setCurrentTree(treeLinks[0] || "");
    setNextId(0);
    setTreeSubMenu([]);
    
    // Clear localStorage
    localStorage.removeItem("currentTree");
    localStorage.removeItem("currentItems");
    
toast.success("All decorations cleared, reverted to default");
  }

  async function handleExport() {
    if (!exportNodeRef.current || isExporting) return;

    // CRITICAL FIX: Clear previous export completely before starting new one
    setExportedImageUrl(null);
    setExportModalOpen(false);
    
    // Wait for state to update and modal to be ready
    await new Promise(resolve => setTimeout(resolve, 150));
    
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

      // IMPROVED: Wait for ALL images to load properly
      let allImagesLoaded = false;
      let attempts = 0;
      const maxAttempts = 8; // Increased attempts

      while (!allImagesLoaded && attempts < maxAttempts) {
        const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
        
        if (imgs.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
          continue;
        }

        const imgLoadPromises = imgs.map(img => {
          return new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              console.warn('Image load timeout:', img.src);
              resolve();
            }, 12000); // Increased timeout

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

              if (!img.complete) {
                const originalSrc = img.src;
                img.src = '';
                setTimeout(() => { img.src = originalSrc; }, 10);
              }
            }
          });
        });

        await Promise.all(imgLoadPromises);
        
        const allLoaded = imgs.every(img => 
          img.complete && img.naturalHeight > 0 && img.naturalWidth > 0
        );
        
        if (allLoaded) {
          allImagesLoaded = true;
        } else {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 400)); // Increased delay
        }
      }

      // Wait for Rnd components
      await new Promise(resolve => setTimeout(resolve, 500));

      // Wait for fonts
      if ((document as any).fonts?.ready) {
        try {
          await Promise.race([
            (document as any).fonts.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Font timeout')), 3000))
          ]);
        } catch (err) {
          console.warn('Font loading timeout or failed', err);
        }
      }

      // CRITICAL: Extended delay to ensure ALL decoration items are fully rendered
      await new Promise(resolve => setTimeout(resolve, 1200)); // Increased to 1.2 seconds

      const ___ = node.offsetWidth;
      const ____ = node.offsetHeight;

      // Force browser to recalculate all images
      const allImages = node.querySelectorAll('img');
      allImages.forEach(img => {
        const src = img.src;
        img.src = '';
        img.src = src;
      });
      
      // Wait for recalculation
      await new Promise(resolve => setTimeout(resolve, 300));

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

        // Set the new image
        setExportedImageUrl(dataUrl);
        setExportModalOpen(true);
        toast.success('Image ready!');
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
    } finally {
      setIsExporting(false);
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

  async function handleShareToX() {
    if (!exportedImageUrl) return;

    try {
      const quote = "I'm in for Week 1 of #RitualXmas\n\nNow it's your turn Ritualist, the holiday magic start with you\n\n@ritualnet @ritualfnd";
      
      try {
        const response = await fetch(exportedImageUrl);
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
    } catch (err) {
      console.error('Share failed:', err);
      const quote = "I'm in for Week 1 of #RitualXmas\n\nNow it's your turn Ritualist, the holiday magic start with you\n\n@ritualnet @ritualfnd";
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

      {/* Save, Clear, Guide and share */}
      <div className="absolute z-20 top-3 right-3 flex gap-1">
        <button
          className="bg-blue-400 hover:bg-blue-500 p-1 rounded-md"
          onClick={handleSave}
        >
          <span className="font-bold">Save</span>
        </button>
        <button
          className="bg-red-400 hover:bg-red-500 p-1 rounded-md"
          onClick={handleClear}
        >
          <span className="font-bold">Clear</span>
        </button>
        <button
          className="bg-green-400 hover:bg-green-500 p-1 rounded-md"
          onClick={() => setGuideModalOpen(true)}
        >
          <span className="font-bold">Guide</span>
        </button>
        <button
          className="bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed p-1 rounded-md text-white"
          onClick={handleExport}
          disabled={isExporting}
        >
          <span className="font-bold">{isExporting ? 'Preparing...' : 'Share to X'}</span>
        </button>
      </div>

      {/* Menu */}
      <div className="fixed bottom-0 md:m-0 md:top-19.75 md:translate-y-0 md:h-fit">
        <div className="flex flex-row w-screen bg-blue-500/25 justify-center md:flex-col md:w-fit md:mb-4 rounded-[7%]">
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'trees' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('trees')}
            aria-pressed={selectedMenu === 'trees'}
          >
            Trees
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'pets' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('pets')}
            aria-pressed={selectedMenu === 'pets'}
          >
            Pets
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'ribbons' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('ribbons')}
            aria-pressed={selectedMenu === 'ribbons'}
          >
            Ribbons
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'items' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('items')}
            aria-pressed={selectedMenu === 'items'}
          >
            Items
          </button>
        </div>

        {/* Tree and item menu */}
        <div className="md:h-fit md:max-h-[60vh] overflow-x-scroll overflow-y-hidden md:overflow-x-hidden md:overflow-y-scroll bg-blue-500/25 rounded-[7%]">
          <div ref={treeMenuRef} className="w-screen whitespace-nowrap md:w-fit md:max-h-full">
            {/* Tree menu */}
            <ul className="flex flex-row md:flex-col">
              {selectedMenu === 'trees' &&
                treeLinks
                  .filter(link => link.endsWith(".1.png"))
                  .map((link, idx) => (
                    <li key={link}>
                      <button
                        className={`w-16 h-16 m-3 inline-block peer ${currentTree === link ? 'ring-4 ring-yellow-300 bg-blue-700' : 'bg-blue-500/50'}`}
                        onClick={() => {
                          setCurrentTree(link);
                          setTreeSubMenu(treeLinks.filter(link => link.startsWith(`trees/${idx + 1}`) && (link.split('/').pop() || link) !== `${idx + 1}.1.png`));
                        }}
                      >
                        <img
                          src={link}
                          alt="Decoration tree"
                          width={40} height={40}
                          className="w-fit h-fit m-auto"
                        />
                      </button>
                      <ul className="relative rounded-md md:absolute bg-red-300 hidden peer-[.ring-yellow-300]:inline-block md:ml-5">
                        {treeSubMenu.length > 0 && treeSubMenu.map(link => (
                          <li
                            key={link}
                            className="inline-block"
                          >
                            <DecorItem
                              imageSrc={link}
                              handleOnClick={() => addDecorItem(link)}
                            />
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                  )
              }
            </ul>
          </div>

          {/* Item menu */}
          {selectedMenu !== 'trees' && (
            <div className="w-screen whitespace-nowrap md:w-fit md:flex md:flex-col">
              {currentMenu.map(link => (
                <DecorItem
                  key={link}
                  imageSrc={link}
                  handleOnClick={() => addDecorItem(link)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[100vmin] max-w-3xl aspect-video border-8 border-solid border-blue-300 overflow-hidden absolute top-0 bottom-0 left-0 right-0 m-auto rounded-[7%]">
        <DecorBox
          tree={currentTree}
          decorItems={decorItems}
          exportNodeRef={exportNodeRef}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onDoubleClick={deleteDecorItem}
          onTouchStart={deleteItemOnDoubleTouch}
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