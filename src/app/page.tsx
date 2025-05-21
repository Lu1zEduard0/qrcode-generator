'use client'

import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider
} from '@mui/material'

export default function Home() {
  const [value, setValue] = useState('https://example.com')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState<string | null>(null)
  const [transparentBg, setTransparentBg] = useState(false)
  const [format, setFormat] = useState<'png' | 'svg' | 'pdf'>('png')

  const qrDownloadRef = useRef<HTMLCanvasElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        setLogo(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const downloadQRCode = async () => {
    const filename = `qrcode.${format}`

    if (format === 'png') {
      const canvas = qrDownloadRef.current
      if (!canvas) return
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    }

    if (format === 'svg') {
      try {
        const svgString = await QRCode.toString(value, {
          type: 'svg',
          color: {
            dark: fgColor,
            light: transparentBg ? '#0000' : bgColor
          }
        })
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error(err)
      }
    }

    if (format === 'pdf') {
      const canvas = qrDownloadRef.current
      if (!canvas) return
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 10, 10, 80, 80)
      pdf.save(filename)
    }
  }

  return (
    <Box className="min-h-screen p-4 bg-gray-100 flex flex-col items-center gap-8">
      <Box className="text-center max-w-2xl">
        <Typography variant="h4" className="mb-2 title">Gerador de QR Code</Typography>
        <Typography variant="subtitle1" className="subtitle">Gere e personalize seu QR Code de forma simples e rápida!</Typography>
      </Box>

      <Box className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Box className="flex flex-col gap-4">
          <TextField
            label="Texto ou link para o QR Code"
            variant="outlined"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
          />

          <TextField
            label="Cor do QR (foreground)"
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            fullWidth
          />

          <TextField
            label="Cor de fundo (background)"
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            fullWidth
            disabled={transparentBg}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={transparentBg}
                onChange={() => setTransparentBg(!transparentBg)}
              />
            }
            label="Fundo transparente"
            className="subtitle"
          />

          <Box>
            <Typography gutterBottom className="text-gray-600">Tamanho: {size}px</Typography>
            <Slider
              value={size}
              onChange={(e, newValue) => setSize(newValue as number)}
              step={32}
              min={64}
              max={1024}
            />
          </Box>

          <Button variant="outlined" component="label">
            Upload de Logo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoUpload}
            />
          </Button>

          <FormControl fullWidth>
            <InputLabel id="format-label">Formato</InputLabel>
            <Select
              labelId="format-label"
              value={format}
              label="Formato"
              onChange={(e) => setFormat(e.target.value as 'png' | 'svg' | 'pdf')}
            >
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="svg">SVG</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={downloadQRCode}>
            Baixar QR Code
          </Button>
        </Box>

        <Box className="flex flex-col items-center justify-center gap-4">
          <Typography variant="h6" className="subtitle">Pré-visualização</Typography>
          <QRCodeCanvas
            value={value}
            size={Math.max(64, Math.min(342, size))}
            bgColor={transparentBg ? 'rgba(0,0,0,0)' : bgColor}
            fgColor={fgColor}
            level="H"
            includeMargin
            imageSettings={
              logo
                ? {
                    src: logo,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }
                : undefined
            }
          />

          <QRCodeCanvas
            ref={qrDownloadRef}
            value={value}
            size={size}
            bgColor={transparentBg ? 'rgba(0,0,0,0)' : bgColor}
            fgColor={fgColor}
            level="H"
            includeMargin
            className="hidden"
            imageSettings={
              logo
                ? {
                    src: logo,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }
                : undefined
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
