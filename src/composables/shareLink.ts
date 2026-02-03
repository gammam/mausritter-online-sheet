import type { Character } from '../types/character'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export const getShareableCharacterState = (characterStore: Record<string, unknown>): Character => {
  const character = { ...characterStore } as Record<string, unknown>

  Object.keys(character).forEach(key => {
    if (key.includes('_') || key.includes('$')) {
      delete character[key]
    }
  })

  return character as Character
}

export const buildShareUrl = (character: Character, hash = window.location.hash): string => {
  const base = `${window.location.origin}${window.location.pathname}`
  const baseHash = hash?.split('?')[0] || '#/'
  const payload = compressToEncodedURIComponent(JSON.stringify(character))
  return `${base}${baseHash}?share=${payload}`
}

export const extractShareCharacter = (hash = window.location.hash): Character | null => {
  const queryString = hash.includes('?') ? hash.split('?')[1] : ''
  const params = new URLSearchParams(queryString)
  const share = params.get('share')

  if (!share) return null

  try {
    const json = decompressFromEncodedURIComponent(share)
    if (!json) return null
    return JSON.parse(json) as Character
  } catch (error) {
    console.error('Errore nel parsing del link condiviso:', error)
    return null
  }
}

export const hasShareParam = (hash = window.location.hash): boolean => {
  const queryString = hash.includes('?') ? hash.split('?')[1] : ''
  const params = new URLSearchParams(queryString)
  return Boolean(params.get('share'))
}
