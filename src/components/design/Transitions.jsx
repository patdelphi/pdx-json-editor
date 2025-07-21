/**
 * 过渡组件
 * 提供各种过渡动画组件
 */

import { useState, useEffect } from 'preact/hooks';
import { Fade, Grow, Slide, Zoom, Collapse, Box } from '@mui/material';

/**
 * 淡入淡出过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 淡入淡出过渡组件
 */
export function FadeTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Fade in={inProp} timeout={timeout} {...rest}>
      {children}
    </Fade>
  );
}

/**
 * 增长过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 增长过渡组件
 */
export function GrowTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Grow in={inProp} timeout={timeout} {...rest}>
      {children}
    </Grow>
  );
}

/**
 * 滑动过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {string} props.direction - 方向（up, down, left, right）
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 滑动过渡组件
 */
export function SlideTransition({ in: inProp, timeout = 300, direction = 'down', children, ...rest }) {
  return (
    <Slide in={inProp} timeout={timeout} direction={direction} {...rest}>
      {children}
    </Slide>
  );
}

/**
 * 缩放过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 缩放过渡组件
 */
export function ZoomTransition({ in: inProp, timeout = 300, children, ...rest }) {
  return (
    <Zoom in={inProp} timeout={timeout} {...rest}>
      {children}
    </Zoom>
  );
}

/**
 * 折叠过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {string} props.orientation - 方向（horizontal, vertical）
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 折叠过渡组件
 */
export function CollapseTransition({ in: inProp, timeout = 300, orientation = 'vertical', children, ...rest }) {
  return (
    <Collapse in={inProp} timeout={timeout} orientation={orientation} {...rest}>
      {children}
    </Collapse>
  );
}

/**
 * 交替过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {React.ReactNode} props.primary - 主要内容
 * @param {React.ReactNode} props.secondary - 次要内容
 * @param {string} props.type - 过渡类型（fade, grow, slide, zoom, collapse）
 * @returns {React.ReactElement} - 交替过渡组件
 */
export function AlternateTransition({
  in: inProp,
  timeout = 300,
  primary,
  secondary,
  type = 'fade',
  ...rest
}) {
  const TransitionComponent = {
    fade: FadeTransition,
    grow: GrowTransition,
    slide: SlideTransition,
    zoom: ZoomTransition,
    collapse: CollapseTransition
  }[type] || FadeTransition;
  
  return (
    <Box position="relative" {...rest}>
      <TransitionComponent in={inProp} timeout={timeout}>
        <div>{primary}</div>
      </TransitionComponent>
      
      <TransitionComponent in={!inProp} timeout={timeout}>
        <Box position="absolute" top={0} left={0} right={0}>
          {secondary}
        </Box>
      </TransitionComponent>
    </Box>
  );
}

/**
 * 序列过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {number} props.delay - 延迟时间
 * @param {React.ReactNode[]} props.children - 子元素
 * @param {string} props.type - 过渡类型（fade, grow, slide, zoom, collapse）
 * @returns {React.ReactElement} - 序列过渡组件
 */
export function SequenceTransition({
  in: inProp,
  timeout = 300,
  delay = 100,
  children,
  type = 'fade',
  ...rest
}) {
  const TransitionComponent = {
    fade: FadeTransition,
    grow: GrowTransition,
    slide: SlideTransition,
    zoom: ZoomTransition,
    collapse: CollapseTransition
  }[type] || FadeTransition;
  
  return (
    <Box {...rest}>
      {Array.isArray(children) ? 
        children.map((child, index) => (
          <TransitionComponent
            key={index}
            in={inProp}
            timeout={timeout}
            style={{ transitionDelay: `${inProp ? index * delay : 0}ms` }}
          >
            <div>{child}</div>
          </TransitionComponent>
        )) : 
        <TransitionComponent in={inProp} timeout={timeout}>
          <div>{children}</div>
        </TransitionComponent>
      }
    </Box>
  );
}

/**
 * 页面过渡组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.in - 是否显示
 * @param {number} props.timeout - 过渡时间
 * @param {string} props.type - 过渡类型（fade, slide, zoom）
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 页面过渡组件
 */
export function PageTransition({
  in: inProp = true,
  timeout = 300,
  type = 'fade',
  children,
  ...rest
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  const TransitionProps = {
    in: mounted && inProp,
    timeout,
    ...rest
  };
  
  switch (type) {
    case 'slide':
      return (
        <Slide {...TransitionProps} direction="up">
          <div>{children}</div>
        </Slide>
      );
    case 'zoom':
      return (
        <Zoom {...TransitionProps}>
          <div>{children}</div>
        </Zoom>
      );
    case 'fade':
    default:
      return (
        <Fade {...TransitionProps}>
          <div>{children}</div>
        </Fade>
      );
  }
}