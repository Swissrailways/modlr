'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Lock, Trash2, ArrowLeft, User, KeyRound, CheckCircle, Pencil } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [currentUsername, setCurrentUsername] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Username form
  const [newUsername, setNewUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameChangedAt, setUsernameChangedAt] = useState<string | null>(null)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setHasPassword(d.hasPassword)
      setCurrentUsername(d.username ?? '')
      setUsernameChangedAt(d.usernameChangedAt ?? null)
    })
  }, [])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassword || undefined, newPassword }),
      })
      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setHasPassword(true)
      } else {
        const data = await res.json()
        setPasswordError(data.error || 'Failed to set password')
      }
    } catch {
      setPasswordError('Connection error. Please try again.')
    }
    setPasswordLoading(false)
  }

  async function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError('')
    setUsernameSuccess(false)
    setUsernameLoading(true)
    try {
      const res = await fetch('/api/auth/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUsername(data.username)
        setUsernameChangedAt(new Date().toISOString())
        setNewUsername('')
        setUsernameSuccess(true)
      } else {
        const data = await res.json()
        setUsernameError(data.error || 'Failed to change username')
      }
    } catch {
      setUsernameError('Connection error. Please try again.')
    }
    setUsernameLoading(false)
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body = hasPassword ? { password: value } : { username: value }
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        router.push('/?deleted=1')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account')
        setLoading(false)
      }
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const canSubmit = hasPassword ? !!value : value === currentUsername

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <h1 className="text-xl font-bold text-white mb-6">Account Settings</h1>

        {/* Change Username */}
        {(() => {
          const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000
          const lastChanged = usernameChangedAt ? new Date(usernameChangedAt).getTime() : null
          const elapsed = lastChanged ? Date.now() - lastChanged : COOLDOWN_MS
          const onCooldown = elapsed < COOLDOWN_MS
          const daysLeft = onCooldown ? Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000)) : 0
          return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Pencil size={16} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">Change Username</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    Current: <span className="text-zinc-300 font-medium">@{currentUsername}</span>
                    {onCooldown && (
                      <span className="ml-2 text-xs text-amber-400">· available in {daysLeft} day{daysLeft === 1 ? '' : 's'}</span>
                    )}
                  </p>
                </div>
              </div>

              {onCooldown ? (
                <p className="text-zinc-500 text-sm bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3">
                  You can change your username once every 30 days.
                </p>
              ) : (
                <form onSubmit={handleChangeUsername} className="space-y-3">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="New username"
                      required
                      minLength={3}
                      maxLength={24}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                    />
                  </div>

                  {usernameError && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{usernameError}</p>
                  )}
                  {usernameSuccess && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                      <CheckCircle size={14} />
                      Username updated successfully.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={usernameLoading || newUsername.length < 3}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    {usernameLoading ? 'Saving...' : 'Update Username'}
                  </button>
                </form>
              )}
            </div>
          )
        })()}

        {/* Set / Change Password */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <KeyRound size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{hasPassword ? 'Change Password' : 'Set Password'}</h2>
              <p className="text-zinc-500 text-sm mt-0.5">
                {hasPassword
                  ? 'Update your password for username/password login.'
                  : 'Add a password so you can also sign in with your username.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-3">
            {hasPassword && (
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
              />
            </div>

            {passwordError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{passwordError}</p>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <CheckCircle size={14} />
                Password {hasPassword ? 'updated' : 'set'} successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              {passwordLoading ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
            </button>
          </form>
        </div>

        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Delete Account</h2>
              <p className="text-zinc-500 text-sm mt-0.5">
                Permanently deletes your account, shop, all listings, and purchase history. This cannot be undone.
              </p>
            </div>
          </div>

          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
            >
              <AlertTriangle size={14} />
              I want to delete my account
            </button>
          ) : (
            <form onSubmit={handleDelete} className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm font-medium">This action is permanent and irreversible.</p>
                <p className="text-red-400/70 text-xs mt-0.5">
                  {hasPassword
                    ? 'Enter your password to confirm.'
                    : `Type your username "${currentUsername}" to confirm.`}
                </p>
              </div>

              <div className="relative">
                {hasPassword
                  ? <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  : <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                }
                <input
                  type={hasPassword ? 'password' : 'text'}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={hasPassword ? 'Your password' : currentUsername}
                  required
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-sm transition-all"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setConfirmed(false); setValue(''); setError('') }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl transition-all text-sm border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  {loading ? 'Deleting...' : 'Delete my account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
