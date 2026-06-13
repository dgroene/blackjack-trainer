import type { Action, Card } from './types'
import { dealerUpcardValue, getPairRank, getHandValue, isPair } from './hand'

type HandCategory = 'pair' | 'soft' | 'hard'

function getCategory(playerCards: Card[]): HandCategory {
  if (isPair(playerCards)) return 'pair'
  if (getHandValue(playerCards).isSoft) return 'soft'
  return 'hard'
}

function dealerLabel(upcardValue: number): string {
  if (upcardValue === 11) return 'Ace'
  if (upcardValue === 10) return '10'
  return String(upcardValue)
}

function actionLabel(action: Action): string {
  switch (action) {
    case 'H':
      return 'Hit'
    case 'S':
      return 'Stand'
    case 'D':
    case 'Ds':
      return 'Double Down'
    case 'P':
      return 'Split'
  }
}

/**
 * Returns a short rule-based explanation for the correct basic strategy decision.
 */
export function getFeedbackMessage(
  correctAction: Action,
  playerCards: Card[],
  dealerUpcard: Card
): string {
  const upcardVal = dealerUpcardValue(dealerUpcard)
  const { total } = getHandValue(playerCards)
  const category = getCategory(playerCards)
  const dl = dealerLabel(upcardVal)
  const act = actionLabel(correctAction)

  if (category === 'pair') {
    const pairRank = getPairRank(playerCards)
    return getPairFeedback(pairRank, correctAction, dl, act)
  }

  if (category === 'soft') {
    return getSoftFeedback(total, upcardVal, correctAction, dl, act)
  }

  return getHardFeedback(total, upcardVal, correctAction, dl, act)
}

function getPairFeedback(
  pairRank: ReturnType<typeof getPairRank>,
  _action: Action,
  dl: string,
  act: string
): string {
  switch (pairRank) {
    case 'A':
      return `Always split Aces — each Ace is the start of a strong hand.`
    case '8':
      return `Always split 8s — a pair of 8s (hard 16) is the worst hand; two separate 8s give you better chances.`
    case 'T':
    case 'J':
    case 'Q':
    case 'K':
      return `Never split 10-value cards — you already have a 20, one of the strongest hands possible.`
    case '5':
      return `Never split 5s — treat them as hard 10 and ${act} vs dealer ${dl}.`
    case '4':
      return `${act} 4s vs dealer ${dl} — splitting only makes sense vs a weak dealer 5 or 6 (DAS benefit).`
    case '2':
    case '3':
      return `${act} 2s/3s vs dealer ${dl} — split vs weak dealer upcards (2–7), hit otherwise.`
    case '6':
      return `${act} 6s vs dealer ${dl} — split vs weak dealer (2–6), hit against strong cards.`
    case '7':
      return `${act} 7s vs dealer ${dl} — split vs 2–7; dealer 8 or higher is too strong.`
    case '9':
      return `${act} 9s vs dealer ${dl} — split except vs 7 (you already beat the dealer's likely 17), 10, or Ace.`
    default:
      return `Basic strategy says: ${act} vs dealer ${dl}.`
  }
}

function getSoftFeedback(
  total: number,
  _upcardVal: number,
  action: Action,
  dl: string,
  act: string
): string {
  switch (total) {
    case 13:
    case 14:
      return `Soft ${total}: ${act} vs dealer ${dl} — only double vs a very weak dealer (5–6); hit everything else.`
    case 15:
    case 16:
      return `Soft ${total}: ${act} vs dealer ${dl} — double vs dealer 4–6; hit otherwise.`
    case 17:
      return `Soft 17 (A,6): ${act} vs dealer ${dl} — double vs 3–6 (dealer is likely to bust); hit vs strong cards.`
    case 18:
      if (action === 'D' || action === 'Ds')
        return `Soft 18 (A,7): Double vs dealer ${dl} — doubling improves your expected value when the dealer is weak.`
      if (action === 'S')
        return `Soft 18 (A,7): Stand vs dealer ${dl} — 18 beats the dealer's likely total of 17.`
      return `Soft 18 (A,7): Hit vs dealer ${dl} — you need more vs a strong upcard; the soft hand can't bust.`
    case 19:
    case 20:
      return `Soft ${total}: Always stand — you have a very strong hand.`
    default:
      return `Basic strategy says: ${act} vs dealer ${dl}.`
  }
}

function getHardFeedback(
  total: number,
  _upcardVal: number,
  action: Action,
  dl: string,
  act: string
): string {
  if (total >= 17) return `Hard ${total}: Always stand — hitting risks busting with low gain.`
  if (total <= 8) return `Hard ${total}: Always hit — your total is too low to stand on.`

  if (total === 11) {
    if (action === 'D')
      return `Hard 11: Double vs dealer ${dl} — 11 is the strongest doubling hand; a 10-value card gives you 21.`
    return `Hard 11: Hit vs dealer Ace — the Ace makes doubling less valuable; take the card instead.`
  }

  if (total === 10) {
    if (action === 'D')
      return `Hard 10: Double vs dealer ${dl} — a 10-value card gives you 20; you're likely ahead.`
    return `Hard 10: Hit vs dealer ${dl} — dealer's strong upcard reduces your doubling advantage.`
  }

  if (total === 9) {
    if (action === 'D')
      return `Hard 9: Double vs dealer ${dl} — dealer is weak; exploit it with an extra bet.`
    return `Hard 9: Hit vs dealer ${dl} — only double against a weak dealer (3–6).`
  }

  if (total >= 13 && total <= 16) {
    if (action === 'S')
      return `Hard ${total}: Stand vs dealer ${dl} — let the dealer bust; they must hit with a weak upcard.`
    return `Hard ${total}: Hit vs dealer ${dl} — dealer is strong; you need to improve your hand.`
  }

  if (total === 12) {
    if (action === 'S')
      return `Hard 12: Stand vs dealer ${dl} — avoid busting; let the dealer take the risk.`
    return `Hard 12: Hit vs dealer ${dl} — the dealer's strong card means you need to improve.`
  }

  return `Basic strategy says: ${act} vs dealer ${dl}.`
}
