// hooks/useAutoScroll.ts
import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoScroll() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const [isUserScrolling, setIsUserScrolling] = useState(false);

	const scrollToBottom = useCallback(() => {
		if (containerRef.current && shouldAutoScroll) {
			containerRef.current.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [shouldAutoScroll]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

			if (!isAtBottom) {
				setIsUserScrolling(true);
				setShouldAutoScroll(false);
			} else {
				setIsUserScrolling(false);
				setShouldAutoScroll(true);
			}
		};

		container.addEventListener("scroll", handleScroll);

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const options = {
			root: null,
			rootMargin: "0px",
			threshold: 1.0,
		};

		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (entry.isIntersecting && !isUserScrolling) {
				setShouldAutoScroll(true);
			}
		};

		const observer = new IntersectionObserver(handleIntersection, options);

		const lastChild = container.lastElementChild;
		if (lastChild) {
			observer.observe(lastChild);
		}

		return () => observer.disconnect();
	}, [isUserScrolling]);

	useEffect(() => {
		if (!isUserScrolling) {
			scrollToBottom();
		}
	}, [scrollToBottom, isUserScrolling]);

	return { containerRef, shouldAutoScroll, scrollToBottom };
}
