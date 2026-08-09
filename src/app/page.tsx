'use client'

import { useEffect, useState } from 'react'
import { Calendar, Plus, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parse, addMonths, subMonths } from 'date-fns'

interface ShiftEntry {
  date: string
  type: 'regular' | 'overtime' | 'sick' | 'off' | 'custom'
  hours: number
}

interface ShiftData {
  [date: string]: ShiftEntry
}

const SHIFT_TYPES = [
  { id: 'regular', label: 'Regular Shift', hours: 7.5, color: 'bg-blue-600' },
  { id: 'overtime', label: 'Overtime', hours: 0, color: 'bg-orange-600', custom: true },
  { id: 'sick', label: 'Sick Day', hours: 0, color: 'bg-red-600' },
  { id: 'off', label: 'Off Day', hours: 0, color: 'bg-gray-600' },
]

export default function Home() {
  const [shifts, setShifts] = useState<ShiftData>({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [overtimeHours, setOvertimeHours] = useState('0.5')
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shiftTrackerData')
    if (saved) {
      setShifts(JSON.parse(saved))
    }
    setLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('shiftTrackerData', JSON.stringify(shifts))
    }
  }, [shifts, loaded])

  const handleAddShift = (type: string, customHours?: number) => {
    if (!selectedDate) return

    let hours = 0
    if (type === 'regular') hours = 7.5
    else if (type === 'overtime') hours = customHours || parseFloat(overtimeHours)
    else if (type === 'sick') hours = 0
    else if (type === 'off') hours = 0
    else if (type === 'custom') hours = customHours || 0

    setShifts((prev) => ({
      ...prev,
      [selectedDate]: {
        date: selectedDate,
        type: type as any,
        hours,
      },
    }))
    setSelectedDate(null)
  }

  const handleDeleteShift = (date: string) => {
    setShifts((prev) => {
      const updated = { ...prev }
      delete updated[date]
      return updated
    })
  }

  const handleExport = () => {
    const monthStr = format(currentDate, 'MMMM yyyy')
    const csv = ['Date,Type,Hours']
    Object.values(shifts).forEach((shift) => {
      csv.push(`${shift.date},${shift.type},${shift.hours}`)
    })

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shifts-${monthStr}.csv`
    a.click()
  }

  const monthShifts = Object.values(shifts).filter((s) => {
    const shiftMonth = format(parse(s.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM')
    const currentMonth = format(currentDate, 'yyyy-MM')
    return shiftMonth === currentMonth
  })

  const totalHours = monthShifts.reduce((sum, s) => sum + s.hours, 0)
  const overtimeTotal = monthShifts
    .filter((s) => s.type === 'overtime')
    .reduce((sum, s) => sum + s.hours, 0)
  const sickDays = monthShifts.filter((s) => s.type === 'sick').length
  const offDays = monthShifts.filter((s) => s.type === 'off').length

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-bold">Shift Tracker</h1>
          </div>
          <p className="text-gray-400">Track your shifts and never get underpaid again</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
            <p className="text-blue-300 text-sm font-semibold mb-2">Total Hours</p>
            <p className="text-3xl font-bold">{totalHours.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-6 border border-orange-700">
            <p className="text-orange-300 text-sm font-semibold mb-2">Overtime Hours</p>
            <p className="text-3xl font-bold">{overtimeTotal.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
            <p className="text-purple-300 text-sm font-semibold mb-2">Sick / Off Days</p>
            <p className="text-3xl font-bold">{sickDays + offDays}</p>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-400 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const shift = shifts[dateStr]
              const isSelected = selectedDate === dateStr

              return (
                <div key={dateStr} className="aspect-square">
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`w-full h-full p-2 rounded-lg border-2 transition flex flex-col items-center justify-center text-xs md:text-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                        : shift
                        ? `${SHIFT_TYPES.find((t) => t.id === shift.type)?.color || 'bg-gray-600'} border-transparent`
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">{format(day, 'd')}</span>
                    {shift && <span className="text-xs opacity-90">{shift.hours}h</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shift Selection Dropdown */}
        {selectedDate && (
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Add Shift for {format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}</h3>
            <div className="space-y-3">
              {SHIFT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAddShift(type.id, type.hours)}
                  className={`w-full p-4 rounded-lg border-2 border-transparent ${type.color} hover:opacity-90 transition font-semibold flex items-center justify-between`}
                >
                  <span>{type.label}</span>
                  {!type.custom && <span className="text-sm opacity-75">{type.hours}h</span>}
                </button>
              ))}
              {/* Overtime Custom Hours */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="Overtime hours"
                />
                <button
                  onClick={() => handleAddShift('overtime', parseFloat(overtimeHours))}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
                >
                  Add OT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shifts List */}
        {monthShifts.length > 0 && (
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Shifts This Month</h3>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {monthShifts
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((shift) => (
                  <div
                    key={shift.date}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div>
                      <p className="font-semibold">{
                        format(parse(shift.date, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')
                      }</p>
                      <p className="text-sm text-gray-400">
                        {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)} - {shift.hours}h
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteShift(shift.date)}
                      className="p-2 hover:bg-red-900 text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
