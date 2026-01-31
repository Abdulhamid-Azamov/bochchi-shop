export function successRes<T>(
  data: T,
  message: string | number = 'Success',
  statusCode = 200,
) {
  return {
    statusCode: typeof message === 'number' ? message : statusCode,
    message: typeof message === 'string' ? message : 'Success',
    data,
  };
}
