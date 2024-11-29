/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import CollectionT from '@/types/Collection';
import Card from './Card';

export default function Collection({ title, items }: CollectionT) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [indexMax, setIndexMax] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  function onBack() {
    if (index <= 0) return;
    const newIndex = index - 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  }

  function onNext() {
    if (index >= indexMax) return;
    const newIndex = index + 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  }

  function scrollToIndex(newIndex: number) {
    if (!cardsContainerRef.current || !cardRef.current) return;
    const cardWidth = cardRef.current.clientWidth + 15; // Include the margin or spacing
    const scrollPos = newIndex * cardWidth;
    cardsContainerRef.current.scrollTo({
      left: scrollPos,
      behavior: 'smooth',
    });
  }

  function onResize() {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const cardWidth = el.clientWidth + 15;
    const sliderWidth = window.innerWidth - 120;
    const cardsCount = items.length;
    const cardsVisible = Math.floor(sliderWidth / cardWidth);
    const newIndexMax = Math.max(0, cardsCount - cardsVisible);
    setIndexMax(newIndexMax);
    if (index > newIndexMax) setIndex(newIndexMax);
  }

  useEffect(() => {
    if (!cardRef.current) return;
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    };

    const onMouseLeave = () => {
      setIsDragging(false);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Adjust this for scroll speed
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <div className="collection">
      <h2 className="collection-title">{title}</h2>

      <div className="collection-slider">
        {/* Left Arrow */}
        {index > 0 && (
          <div className="collection-arrow" onClick={onBack}>
            <i className="fa-solid fa-chevron-left"></i>
          </div>
        )}

        <div
          className="collection-cards"
          ref={cardsContainerRef}
          style={{
            display: 'flex',
            overflowX: 'auto', // Allow horizontal scrolling
            scrollBehavior: 'smooth', // Smooth scroll when using scrollTo
            cursor: isDragging ? 'grabbing' : 'grab', // Change cursor based on dragging state
          }}
        >
          {items.map((item, i) => {
            return <Card key={i} Ref={i === 0 ? cardRef : undefined} {...item} />;
          })}
        </div>

        {/* Right Arrow */}
        {index < indexMax && (
          <div className="collection-arrow right" onClick={onNext}>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        )}
      </div>
    </div>
  );
}
