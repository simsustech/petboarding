import { vacations2024 } from './nl/vacations-2024.js'
import { vacations2025 } from './nl/vacations-2025.js'
import { vacations2026 } from './nl/vacations-2026.js'
import { vacations2027 } from './nl/vacations-2027.js'
import { vacations2028 } from './nl/vacations-2028.js'
import { vacations2029 } from './nl/vacations-2029.js'
import { vacations2030 } from './nl/vacations-2030.js'

export const getAllVacations = () => [
  ...vacations2024,
  ...vacations2025,
  ...vacations2026,
  ...vacations2027,
  ...vacations2028,
  ...vacations2029,
  ...vacations2030
]
