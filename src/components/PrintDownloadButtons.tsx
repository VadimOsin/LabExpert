import React, { forwardRef, RefObject } from 'react'
import { CButton, CCol } from '@coreui/react-pro'
import html2pdf from 'html2pdf.js'

interface PrintDownloadButtonsProps {
  contentRef?: RefObject<HTMLDivElement>
  fileUrl?: string
  signatureContent?: RefObject<HTMLDivElement>
}

const PrintDownloadButtons = forwardRef<
  HTMLDivElement,
  PrintDownloadButtonsProps
>(({ contentRef, signatureContent, fileUrl }, ref) => {
  const handlePrint = () => {
    if (contentRef?.current) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write('<html><head><title>Print</title>')
        newWindow.document.write('</head><body>')
        newWindow.document.write(contentRef.current.innerHTML)
        if (signatureContent?.current) {
          newWindow.document.write(signatureContent.current.innerHTML)
        }

        newWindow.document.write('</body></html>')
        newWindow.document.close()

        newWindow.focus()
        newWindow.print()

        setTimeout(() => {
          newWindow.close()
        }, 300)
      }
    } else if (fileUrl) {
      const windowForPrint = window.open(fileUrl)

      if (windowForPrint) {
        windowForPrint.focus()
        windowForPrint.print()
      } else {
        console.warn('Failed to open new window for printing the PDF.')
      }
    } else {
      console.warn('No contentRef or fileUrl provided for printing.')
    }
  }

  const handleDownload = async () => {
    if (fileUrl) {
      try {
        const response = await fetch(fileUrl)

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const blob = await response.blob()
        const element = document.createElement('a')
        const url = URL.createObjectURL(blob)

        element.href = url
        element.download = fileUrl.split('/').pop() || 'file.pdf' // Имя файла

        document.body.appendChild(element)
        element.click()

        document.body.removeChild(element)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download file:', error)
      }
    } else if (contentRef?.current) {
      const element = contentRef.current
      let addElement: any = null
      let previousDisplay = ''

      if (signatureContent?.current) {
        addElement = signatureContent.current
        previousDisplay = addElement.style.display
        addElement.style.display = 'block'
        element.appendChild(addElement)
      }

      const options = {
        margin: 1,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }

      html2pdf()
        .from(element)
        .set(options)
        .save()
        .finally(() => {
          if (addElement) {
            addElement.style.display = previousDisplay
          }
        })
    } else {
      console.warn('No contentRef or fileUrl provided for download.')
    }
  }

  return (
    <CCol
      ref={ref}
      style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '50px' }}
    >
      <CButton
        className="btn btn-primary"
        onClick={handlePrint}
        style={{ width: '309px', backgroundColor: '#6f42c1' }}
      >
        Печать
      </CButton>
      <CButton
        className="btn btn-primary"
        onClick={handleDownload}
        style={{
          width: '309px',
          marginLeft: '30px',
          backgroundColor: '#6f42c1',
        }}
      >
        Скачать
      </CButton>
    </CCol>
  )
})

PrintDownloadButtons.displayName = 'PrintDownloadButtons'

export default PrintDownloadButtons
