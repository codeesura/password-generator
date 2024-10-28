'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, RefreshCw  } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SwitchDarkMode from "@/components/theme-switcher";

// Helper function to generate SHA-256 hash
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Function to generate salt
async function generateSalt(password1: string, password2: string) {
  const combined = password1 + password2
  const hash = await sha256(combined)
  return hash.substring(0, 16)
}

// Function to generate password
async function generatePassword(password1: string, password2: string, length: number) {
  const salt = await generateSalt(password1, password2)
  const hash = await sha256(password1 + password2 + salt)
  
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  let password = ''
  let seedValue = parseInt(hash.substring(0, 8), 16)

  // Function to get a random character from a string
  const getRandomChar = (chars: string) => {
    seedValue = seedValue * 16807 % 2147483647
    return chars[seedValue % chars.length]
  }

  // Ensure at least 3 of each required character type
  for (let i = 0; i < 3; i++) {
    password += getRandomChar(uppercaseChars)
    password += getRandomChar(lowercaseChars)
    password += getRandomChar(numberChars)
    password += getRandomChar(specialChars)
  }

  // Fill the rest of the password
  while (password.length < length) {
    password += getRandomChar(allChars)
  }

  // Shuffle the password
  const passwordArray = password.split('')
  for (let i = passwordArray.length - 1; i > 0; i--) {
    seedValue = seedValue * 16807 % 2147483647
    const j: number = seedValue % (i + 1)
    ;[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]
  }

  return passwordArray.join('')
}

export default function Component() {
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [passwordLength, setPasswordLength] = useState(16)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePassword = async () => {
    if (password1.length < 6 || password2.length < 6) {
      setError('Both passwords must be at least 6 characters long.')
      return
    }
    setError('')
    setIsGenerating(true)
    try {
      const newPassword = await generatePassword(password1, password2, passwordLength)
      setGeneratedPassword(newPassword)
    } catch (err) {
      setError(`An error occurred while generating the password ${err}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen w-full p-4 relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <SwitchDarkMode />

      </div>
      <Card className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center md:text-3xl">Advanced Secure Password Generator</CardTitle>
          <CardDescription className="text-center md:text-lg">Enter two passwords to generate a strong, combined password.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-2">
              <Label htmlFor="password1" className="text-sm font-medium md:text-base">Password 1</Label>
              <div className="relative">
                <Input
                  type={showPassword1 ? "text" : "password"}
                  id="password1"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  className="pr-10 md:text-lg"
                  placeholder="Enter first password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword1(!showPassword1)}
                  aria-label={showPassword1 ? "Hide password" : "Show password"}
                >
                  {showPassword1 ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2" className="text-sm font-medium md:text-base">Password 2</Label>
              <div className="relative">
                <Input
                  type={showPassword2 ? "text" : "password"}
                  id="password2"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="pr-10 md:text-lg"
                  placeholder="Enter second password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword2(!showPassword2)}
                  aria-label={showPassword2 ? "Hide password" : "Show password"}
                >
                  {showPassword2 ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="passwordLength" className="text-sm font-medium md:text-base">Password Length</Label>
                <span className="text-sm font-medium md:text-base">{passwordLength}</span>
              </div>
              <Slider
                id="passwordLength"
                min={16}
                max={64}
                step={1}
                value={[passwordLength]}
                onValueChange={(value) => setPasswordLength(value[0])}
                className="w-full"
              />
            </div>
            {error && <p className="text-destructive text-sm text-center md:text-base">{error}</p>}
            <Button 
              className="w-full md:text-lg md:py-6" 
              onClick={handleGeneratePassword}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Strong Password'
              )}
            </Button>
            {generatedPassword && (
              <div className="mt-4 p-4 bg-secondary rounded-md">
                <p className="text-sm font-medium mb-2 md:text-base">Generated Password:</p>
                <div className="flex items-center justify-between bg-background p-2 rounded">
                  <code className="text-sm break-all md:text-base">{generatedPassword}</code>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={copyToClipboard} aria-label="Copy password">
                          {copied ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <Copy className="h-4 w-4 md:h-5 md:w-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}