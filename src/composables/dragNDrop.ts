import { BodyBack, PackBack, BodyIndexes, PackIndexes } from '../types/inventory'
import { Card, Bank } from '../types/cards'

// Helper per ottenere lo slot successivo nel packBack (orizzontale)
const getNextPackSlot = (currentSlot: string): string | null => {
  const slotNumber = parseInt(currentSlot)
  if (slotNumber >= 1 && slotNumber < 6) {
    return (slotNumber + 1).toString()
  }
  return null
}

// Helper per ottenere lo slot sotto nel packBack (verticale: 1→4, 2→5, 3→6)
const getVerticalPackSlot = (currentSlot: string): string | null => {
  const slotNumber = parseInt(currentSlot)
  if (slotNumber >= 1 && slotNumber <= 3) {
    return (slotNumber + 3).toString()
  }
  return null
}

// Helper per verificare se uno slot è disponibile
const isSlotAvailable = (inventory: BodyBack | PackBack, slotId: string): boolean => {
  const slot = inventory[slotId as keyof typeof inventory]
  return slot && !slot.item && !slot.occupiedBy
}

// Helper per verificare se ci sono abbastanza slot liberi per un item
// Restituisce l'orientamento possibile: 'horizontal', 'vertical', o null
const canPlaceItem = (inventory: BodyBack | PackBack, slotId: string, slots: number, type: string): 'horizontal' | 'vertical' | null => {
  if (slots === 1) {
    return isSlotAvailable(inventory, slotId) ? 'horizontal' : null
  }
  
  // Per item a 2 slot nel packBack, prova prima orizzontale poi verticale
  if (type === 'packBack') {
    // Prova orizzontale (slot affiancati)
    const nextSlot = getNextPackSlot(slotId)
    if (nextSlot && isSlotAvailable(inventory, slotId) && isSlotAvailable(inventory, nextSlot)) {
      return 'horizontal'
    }
    
    // Prova verticale (slot sovrapposti)
    const verticalSlot = getVerticalPackSlot(slotId)
    if (verticalSlot && isSlotAvailable(inventory, slotId) && isSlotAvailable(inventory, verticalSlot)) {
      return 'vertical'
    }
    
    return null
  }
  
  // Per bodyBack, non permettiamo item a 2 slot
  return null
}

// Helper per pulire slot occupiedBy orfani (quando il principale viene rimosso)
const cleanOrphanedSlots = (inventory: PackBack): PackBack => {
  const cleanedInventory = { ...inventory }
  const occupiedSlots = new Set<string>()
  
  // Raccoglie tutti gli slot effettivamente occupati da item a 2 slot
  Object.entries(cleanedInventory).forEach(([key, slot]) => {
    if (slot.item && slot.item.slots === 2) {
      const nextSlot = getNextPackSlot(key)
      if (nextSlot) {
        occupiedSlots.add(nextSlot)
      }
    }
  })
  
  // Pulisce gli slot occupiedBy che non hanno più un riferimento valido
  Object.entries(cleanedInventory).forEach(([key, slot]) => {
    if (slot.occupiedBy && !occupiedSlots.has(key)) {
      cleanedInventory[key as PackIndexes] = {
        ...slot,
        occupiedBy: undefined
      }
    }
  })
  
  return cleanedInventory
}

export const onDragging = (event: DragEvent, item: Card) => {
  if (event.dataTransfer) {    
    const data: Card = {
      id: (event.target as Node).parentElement?.id as BodyIndexes | PackIndexes || null,
      title: item.title,
      stat: item.stat || null,
      image: item.image,
      type: item.type || null,
      group: item.group,
      used: 0,
      description: item.description || null,
      clear: item.clear || null,
      hirelingIndex: (event.target as Node).parentElement?.dataset.index || null,
      warband: (event.target as Node).parentElement?.dataset.warband || null,
      slots: item.slots || 1,
      orientation: item.orientation
    }

    if (((event.target as Node).childNodes[1] as HTMLElement).classList.contains('status')) {
      (event.target as Node).childNodes[1].childNodes[0].childNodes.forEach(point => {
        if ((point as HTMLElement).classList?.contains('used')) {
          data.used += 1
        }
      })
    }
    
    if (data.id) event.dataTransfer.setData('id', data.id)
    event.dataTransfer.setData('text', data.title)
    if (data.stat) event.dataTransfer.setData('stat', data.stat)
    event.dataTransfer.setData('image', data.image)
    if (data.type) event.dataTransfer.setData('type', data.type)
    if (data.group) event.dataTransfer.setData('group', data.group)
    event.dataTransfer.setData('used', data.used.toString())    
    if (data.description) event.dataTransfer.setData('description', data.description)
    if (data.clear) event.dataTransfer.setData('clear', data.clear)
    if (data.hirelingIndex) event.dataTransfer.setData('hirelingIndex', data.hirelingIndex.toString())
    if (data.warband) event.dataTransfer.setData('warband', data.warband.toString())
    if (data.slots) event.dataTransfer.setData('slots', data.slots.toString())
    if (data.orientation) event.dataTransfer.setData('orientation', data.orientation)
  }
}

export const allowDrop = (event: DragEvent) => {
  event.preventDefault()
  ;(event.target as HTMLElement).classList.add('droppable')
}

export const leaveDrag = (event: DragEvent) => {
  event.preventDefault()
  ;(event.target as HTMLElement).classList.remove('droppable')
}

export const drop = async (event: DragEvent, type: string, store: any) => {
  event.preventDefault()

  const firstChild: ChildNode = (event.target as Node).childNodes[0]

  const slotId = event.dataTransfer
      ? event.dataTransfer.getData('id')
      : null

  const data = event.dataTransfer
    ? {
      id: event.dataTransfer.getData('id'),
      title: event.dataTransfer.getData('text'),
      stat: event.dataTransfer.getData('stat'),
      image: event.dataTransfer.getData('image'),
      type: event.dataTransfer.getData('type'),
      group: event.dataTransfer.getData('group'),
      used: event.dataTransfer.getData('used'),
      description: event.dataTransfer.getData('description'),
      clear: event.dataTransfer.getData('clear'),
      slots: parseInt(event.dataTransfer.getData('slots')) || 1,
      orientation: event.dataTransfer.getData('orientation') as 'horizontal' | 'vertical' || undefined
    }
    : null

  const moveFrom = async () => {    
    const hirelingIndex = event.dataTransfer?.getData('hirelingIndex')
    const warband = event.dataTransfer?.getData('warband') === 'warband' ? true : false
    const itemSlots = data?.slots || 1
    const itemOrientation = data?.orientation

    if (slotId && slotId.includes('bnk')) {
      let newBank = store.bank

      newBank[+slotId.substring(5)] = {
        name: slotId,
        item: null
      }
      newBank = newBank.filter((item: Bank) => item.item !== null)
      newBank.forEach((item: Bank, index: number) => item.name = `bnk__${index}`)
      newBank.push({
        name: `bnk__${newBank.length}`,
        item: null
      })        

      store.updateBankItems(newBank)
    }

    if (slotId && slotId.includes('grit')) {
      store.updateGrit({
        ...store.grit,
        [slotId]: {
          name: slotId,
          item: null
        }
      })
    }
    
    if (slotId && !hirelingIndex && warband) {
      if (Object.keys(store.bodyBack).includes(slotId)) {
        store.updateWarbandItems('bodyBack', {
          ...store.warband.bodyBack as BodyBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0
          }
        })
      }

      if (Object.keys(store.packBack).includes(slotId)) {
        const updatedPack = {
          ...store.warband.packBack as PackBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0,
            occupiedBy: undefined
          }
        }
        
        // Se l'item occupava 2 slot, libera anche il secondo in base all'orientamento
        if (itemSlots === 2 && itemOrientation) {
          const secondSlot = itemOrientation === 'horizontal' 
            ? getNextPackSlot(slotId) 
            : getVerticalPackSlot(slotId)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              used: 0,
              occupiedBy: undefined
            }
          }
        }
        
        store.updateWarbandItems('packBack', updatedPack)
      }
    }

    if (slotId && !hirelingIndex && !warband) {
      if (Object.keys(store.bodyBack).includes(slotId)) {
        store.updateItems('bodyBack', {
          ...store.bodyBack as BodyBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0
          }
        })
      }

      if (Object.keys(store.packBack).includes(slotId)) {
        const updatedPack = {
          ...store.packBack as PackBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0,
            occupiedBy: undefined
          }
        }
        
        // Se l'item occupava 2 slot, libera anche il secondo in base all'orientamento
        if (itemSlots === 2 && itemOrientation) {
          const secondSlot = itemOrientation === 'horizontal' 
            ? getNextPackSlot(slotId) 
            : getVerticalPackSlot(slotId)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              used: 0,
              occupiedBy: undefined
            }
          }
        }
        
        store.updateItems('packBack', updatedPack)
      }
    }

    if (slotId && hirelingIndex) {
      if (Object.keys(store.bodyBack).includes(slotId)) {
        store.updateHirelingItems('bodyBack', {
          ...store.hirelings[hirelingIndex].bodyBack as BodyBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0
          }
        }, hirelingIndex)
      }

      if (Object.keys(store.packBack).includes(slotId)) {
        const updatedPack = {
          ...store.hirelings[hirelingIndex].packBack as PackBack,
          [slotId]: {
            name: slotId,
            item: null,
            used: 0,
            occupiedBy: undefined
          }
        }
        
        // Se l'item occupava 2 slot, libera anche il secondo in base all'orientamento
        if (itemSlots === 2 && itemOrientation) {
          const secondSlot = itemOrientation === 'horizontal' 
            ? getNextPackSlot(slotId) 
            : getVerticalPackSlot(slotId)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              used: 0,
              occupiedBy: undefined
            }
          }
        }
        
        store.updateHirelingItems('packBack', updatedPack, hirelingIndex)
      }
    }
  }
    
  const moveTo = () => {
    const id = (event.target as HTMLElement).id
      ? (event.target as HTMLElement).id
      : null

    const hirelingIndex = firstChild.parentElement?.dataset.index
    const warband = firstChild.parentElement?.dataset.warband === 'warband' ? true : false
    const itemSlots = data?.slots || 1

    if (data && id && type === 'bank') {
      const nextId = `bnk__${+id.substring(5) + 1}`

      const newBank = store.bank
      newBank[+id.substring(5)] = {
        name: id,
        item: data
      }
      newBank[+id.substring(5) + 1] = {
        name: nextId,
        item: null
      }

      store.updateBankItems(newBank)
    }
    
    if (data && id && type === 'grit') {
      store.updateGrit({
        ...store.grit,
        [id]: {
          name: id,
          item: data
        }
      })
    }

    if (data && id && !hirelingIndex && warband) {
      if (type === 'bodyBack') {        
        store.updateWarbandItems('bodyBack', {
          ...store.warband.bodyBack as BodyBack,
          [id]: {
            name: id,
            item: data
          }
        })
      }

      if (type === 'packBack') {
        // Verifica se c'è spazio per l'item e determina l'orientamento
        const orientation = canPlaceItem(store.warband.packBack, id, itemSlots, type)
        if (!orientation) {
          return // Non può essere posizionato
        }
        
        // Salva l'item con il suo orientamento
        const itemWithOrientation = itemSlots === 2 
          ? { ...data, orientation } 
          : data
        
        const updatedPack = {
          ...store.warband.packBack as PackBack,
          [id]: {
            name: id,
            item: itemWithOrientation
          }
        }
        
        // Se l'item occupa 2 slot, marca il secondo come occupato in base all'orientamento
        if (itemSlots === 2) {
          const secondSlot = orientation === 'horizontal' 
            ? getNextPackSlot(id) 
            : getVerticalPackSlot(id)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              occupiedBy: id
            }
          }
        }
        
        store.updateWarbandItems('packBack', updatedPack)
      }
    }

    if (data && id && !hirelingIndex && !warband) {
      if (type === 'bodyBack') {
        store.updateItems('bodyBack', {
          ...store.bodyBack as BodyBack,
          [id]: {
            name: id,
            item: data
          }
        })
      }

      if (type === 'packBack') {
        // Verifica se c'è spazio per l'item e determina l'orientamento
        const orientation = canPlaceItem(store.packBack, id, itemSlots, type)
        if (!orientation) {
          return // Non può essere posizionato
        }
        
        // Salva l'item con il suo orientamento
        const itemWithOrientation = itemSlots === 2 
          ? { ...data, orientation } 
          : data
        
        const updatedPack = {
          ...store.packBack as PackBack,
          [id]: {
            name: id,
            item: itemWithOrientation
          }
        }
        
        // Se l'item occupa 2 slot, marca il secondo come occupato in base all'orientamento
        if (itemSlots === 2) {
          const secondSlot = orientation === 'horizontal' 
            ? getNextPackSlot(id) 
            : getVerticalPackSlot(id)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              occupiedBy: id
            }
          }
        }
        
        store.updateItems('packBack', updatedPack)
      }
    }

    if (data && id && hirelingIndex) {
      if (type === 'bodyBack') {
        store.updateHirelingItems('bodyBack', {
          ...store.hirelings[hirelingIndex].bodyBack as BodyBack,
          [id]: {
            name: id,
            item: data
          }
        }, hirelingIndex)
      }

      if (type === 'packBack') {
        // Verifica se c'è spazio per l'item e determina l'orientamento
        const orientation = canPlaceItem(store.hirelings[hirelingIndex].packBack, id, itemSlots, type)
        if (!orientation) {
          return // Non può essere posizionato
        }
        
        // Salva l'item con il suo orientamento
        const itemWithOrientation = itemSlots === 2 
          ? { ...data, orientation } 
          : data
        
        const updatedPack = {
          ...store.hirelings[hirelingIndex].packBack as PackBack,
          [id]: {
            name: id,
            item: itemWithOrientation
          }
        }
        
        // Se l'item occupa 2 slot, marca il secondo come occupato in base all'orientamento
        if (itemSlots === 2) {
          const secondSlot = orientation === 'horizontal' 
            ? getNextPackSlot(id) 
            : getVerticalPackSlot(id)
          
          if (secondSlot) {
            updatedPack[secondSlot as PackIndexes] = {
              name: secondSlot,
              item: null,
              occupiedBy: id
            }
          }
        }
        
        store.updateHirelingItems('packBack', updatedPack, hirelingIndex)
      }
    }
  }
  
  const cases = {
    items: firstChild && data?.group === 'items'
      && !slotId?.includes('bnk') 
      && (type === 'bodyBack' || type === 'packBack' || type === 'bank' || type === 'drop'),
    bankItems: firstChild && data?.group === 'items'
      && slotId?.includes('bnk') && type !== 'bank' 
      && (type === 'bodyBack' || type === 'packBack' || type === 'drop'),
    conditions: firstChild && data?.group === 'conditions'
      && (type === 'packBack' || type === 'grit' || type === 'drop'),
    drop: type === 'drop' && (data?.group === 'items' || data?.group === 'conditions')
  }  

  if ((event.target as HTMLElement).id
      && (cases.items || cases.bankItems || cases.conditions || cases.drop)) {
      await moveFrom()
      moveTo()
  } else {
    (event.target as HTMLElement).classList.remove('droppable')
    return null
  }

  (event.target as HTMLElement).classList.remove('droppable')
}