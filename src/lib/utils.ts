import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from '@/hooks/use-toast'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Triggers the browser print dialog.
 * If running inside an iframe (like the preview), it attempts to open the app in a new tab
 * and trigger the print dialog there, as iframes block modals like print().
 */
export function generatePDF(layout: string = 'simples') {
  try {
    let isIframe = false
    try {
      isIframe = window.self !== window.top
    } catch (e) {
      isIframe = true // If it throws, we are definitely in a cross-origin iframe
    }

    if (isIframe) {
      const url = new URL(window.location.href)
      url.searchParams.set('print', layout)
      const newWin = window.open(url.toString(), '_blank')
      if (!newWin) {
        toast({
          title: 'Pop-up bloqueado',
          description:
            'Não foi possível abrir a janela de impressão. Permita pop-ups no seu navegador ou acesse o sistema fora da pré-visualização.',
          variant: 'destructive',
        })
      }
    } else {
      document.body.setAttribute('data-print-layout', layout)
      setTimeout(() => {
        window.print()
        document.body.removeAttribute('data-print-layout')
      }, 300)
    }
  } catch (error) {
    // Fallback
    window.print()
  }
}
