/**
 * 卡片组件
 * 基于设计系统的卡片组件
 */

import { Card as MuiCard, CardContent, CardHeader, CardActions, CardMedia } from '@mui/material';

/**
 * 卡片组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.header - 卡片头部
 * @param {React.ReactNode} props.media - 卡片媒体
 * @param {React.ReactNode} props.content - 卡片内容
 * @param {React.ReactNode} props.actions - 卡片操作
 * @param {number} props.elevation - 卡片阴影
 * @param {boolean} props.outlined - 是否显示边框
 * @param {string} props.id - 卡片ID
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @param {React.ReactNode} props.children - 子元素
 * @returns {React.ReactElement} - 卡片组件
 */
export function Card({
  header,
  media,
  content,
  actions,
  elevation = 1,
  outlined = false,
  id,
  className,
  sx,
  children,
  ...rest
}) {
  return (
    <MuiCard
      elevation={elevation}
      variant={outlined ? 'outlined' : 'elevation'}
      id={id}
      className={className}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        ...sx
      }}
      {...rest}
    >
      {header && (
        typeof header === 'object' ? 
          <CardHeader {...header} /> : 
          <CardHeader title={header} />
      )}
      
      {media && (
        typeof media === 'object' ? 
          <CardMedia {...media} /> : 
          <CardMedia component="img" image={media} />
      )}
      
      {content && (
        typeof content === 'object' && content.type !== CardContent ? 
          <CardContent>{content}</CardContent> : 
          content
      )}
      
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
      
      {actions && (
        typeof actions === 'object' && actions.type !== CardActions ? 
          <CardActions>{actions}</CardActions> : 
          actions
      )}
    </MuiCard>
  );
}

/**
 * 卡片内容组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子元素
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 卡片内容组件
 */
export function CardBody({ children, className, sx, ...rest }) {
  return (
    <CardContent
      className={className}
      sx={{
        '&:last-child': {
          paddingBottom: 2
        },
        ...sx
      }}
      {...rest}
    >
      {children}
    </CardContent>
  );
}

/**
 * 卡片头部组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 标题
 * @param {string} props.subheader - 副标题
 * @param {React.ReactNode} props.avatar - 头像
 * @param {React.ReactNode} props.action - 操作
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 卡片头部组件
 */
export function CardTitle({ title, subheader, avatar, action, className, sx, ...rest }) {
  return (
    <CardHeader
      title={title}
      subheader={subheader}
      avatar={avatar}
      action={action}
      className={className}
      sx={{
        padding: '16px',
        ...sx
      }}
      {...rest}
    />
  );
}

/**
 * 卡片操作组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子元素
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 卡片操作组件
 */
export function CardFooter({ children, className, sx, ...rest }) {
  return (
    <CardActions
      className={className}
      sx={{
        padding: '8px 16px',
        ...sx
      }}
      {...rest}
    >
      {children}
    </CardActions>
  );
}

/**
 * 卡片媒体组件
 * @param {Object} props - 组件属性
 * @param {string} props.image - 图片地址
 * @param {string} props.alt - 图片替代文本
 * @param {number} props.height - 图片高度
 * @param {string} props.className - 自定义类名
 * @param {Object} props.sx - 自定义样式
 * @returns {React.ReactElement} - 卡片媒体组件
 */
export function CardImage({ image, alt, height = 140, className, sx, ...rest }) {
  return (
    <CardMedia
      component="img"
      image={image}
      alt={alt}
      height={height}
      className={className}
      sx={{
        objectFit: 'cover',
        ...sx
      }}
      {...rest}
    />
  );
}