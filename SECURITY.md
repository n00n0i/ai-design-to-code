# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities by opening an issue or contacting the maintainers directly.

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate keys regularly

### Code Execution
- Sandpack provides client-side isolation
- No server-side code execution
- Review generated code before use

### Self-Hosting
- Keep Penpot instance internal or behind authentication
- Regular security updates
- Backup data regularly
