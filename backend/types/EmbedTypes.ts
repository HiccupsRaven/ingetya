export interface APIEmbedAuthor {
  icon_url?: string
  name: string
  proxy_icon_url?: string
  url?: string
}

export interface APIEmbedField {
  inline?: boolean
  name: string
  value: string
}

export interface APIEmbedFooter {
  icon_url?: string
  proxy_icon_url?: string
  text: string
}

export interface APIEmbedImage {
  height?: number
  proxy_url?: string
  url: string
  width?: number
}

export interface APIEmbedProvider {
  name?: string
  url?: string
}

export interface APIEmbedThumbnail {
  height?: number
  proxy_url?: string
  url: string
  width?: number
}

export interface APIEmbedVideo {
  height?: number
  proxy_url?: string
  url?: string
  width?: number
}

export enum COLORS {
  BLURPLE = 5793265,
  RED = 16739950,
  LIME = 7130225,
  YELLOW = 13283420,
  FUCHSIA = 15418781,
  CYAN = 65535
}

export interface APIEmbed {
  author?: APIEmbedAuthor
  color?: COLORS | number
  description: string
  fields?: APIEmbedField[]
  footer?: APIEmbedFooter
  image?: APIEmbedImage
  provider?: APIEmbedProvider
  thumbnail?: APIEmbedThumbnail
  timestamp?: Date | string | boolean
  title?: string
  url?: string
  video?: string
}
