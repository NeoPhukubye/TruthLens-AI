import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('truthlens-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred'
    return Promise.reject(new ApiError(message, error.response?.status))
  }
)

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Auth
export const authApi = {
  register(data: { email: string; username: string; password: string }) {
    return api.post('/auth/register', data)
  },
  login(email: string, password: string) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  me() {
    return api.get('/auth/me')
  },
}

// Analyze
export const analyzeApi = {
  analyze(content: string, content_type: string) {
    return api.post('/analyze/', { content, content_type })
  },
}

// Credibility
export const credibilityApi = {
  check(content: string, source_url?: string) {
    return api.post('/credibility/', { content, source_url })
  },
}

// Bias
export const biasApi = {
  detect(content: string) {
    return api.post('/bias/', { content })
  },
}

// Fact Check
export const factcheckApi = {
  check(claims: string[]) {
    return api.post('/factcheck/', { claims })
  },
}

// Images
export const imagesApi = {
  analyze(file: File) {
    const form = new FormData()
    form.append('file', file)
    return api.post('/images/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  compare(original: File, suspect: File) {
    const form = new FormData()
    form.append('original', original)
    form.append('suspect', suspect)
    return api.post('/images/compare', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// Sources
export const sourcesApi = {
  check(url: string) {
    return api.post('/sources/check', { url })
  },
}

// Learn
export const learnApi = {
  getLesson(topic: string, level: string = 'beginner') {
    return api.post('/learn/lesson', { topic, level })
  },
}

// Quiz
export const quizApi = {
  generate(topic: string, difficulty: string = 'medium') {
    return api.post('/quiz/generate', { topic, difficulty })
  },
}

// Debates
export const debatesApi = {
  list() {
    return api.get('/debates/list')
  },
  get(id: string) {
    return api.get(`/debates/${id}`)
  },
  create(data: { topic: string; description: string; side_a_label: string; side_b_label: string }) {
    return api.post('/debates/create', data)
  },
  join(debateId: string, username: string, side: string) {
    return api.post(`/debates/${debateId}/join`, { username, side })
  },
  argue(debateId: string, username: string, side: string, argument: string) {
    return api.post(`/debates/${debateId}/argue`, { username, side, argument })
  },
  summarize(debateId: string) {
    return api.post(`/debates/${debateId}/summarize`)
  },
  close(debateId: string) {
    return api.post(`/debates/${debateId}/close`)
  },
  trending() {
    return api.get('/debates/trending/topics')
  },
}

export default api
