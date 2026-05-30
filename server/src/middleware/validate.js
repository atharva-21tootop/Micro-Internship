import { ZodError } from 'zod'

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    req.body = parsed.body ?? req.body
    req.query = parsed.query ?? req.query
    req.params = parsed.params ?? req.params
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    next(error)
  }
}
