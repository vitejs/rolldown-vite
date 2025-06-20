import type { Plugin } from 'rolldown'

/**
 * Plugin to fix graceful-fs compatibility issues with Rolldown
 * 
 * graceful-fs uses Object.setPrototypeOf operations that can create
 * cyclic __proto__ values when bundled by Rolldown, causing runtime errors.
 * 
 * This plugin detects and safely transforms these problematic patterns.
 */
export function gracefulFsCompatPlugin(): Plugin {
  return {
    name: 'vite:graceful-fs-compat',
    transform: {
      filter: {
        id: /graceful-fs/,
      },
      handler(code, id) {
        // Only process graceful-fs related modules
        if (!id.includes('graceful-fs')) {
          return null
        }

        let transformedCode = code

        // Pattern 1: Fix Object.setPrototypeOf calls that can cause cyclic __proto__
        // Replace: Object.setPrototypeOf(target, source)
        // With: Safe prototype setting that avoids cycles
        const setPrototypeOfPattern = /Object\.setPrototypeOf\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g
        transformedCode = transformedCode.replace(setPrototypeOfPattern, (match, target, source) => {
          return `(function() {
            try {
              if (${target} && ${source} && ${target} !== ${source}) {
                // Check for potential cycles before setting prototype
                let current = ${source}
                while (current) {
                  if (current === ${target}) {
                    // Cycle detected, skip prototype setting
                    return
                  }
                  current = Object.getPrototypeOf(current)
                  // Prevent infinite loops
                  if (current === Object.prototype || current === Function.prototype) {
                    break
                  }
                }
                Object.setPrototypeOf(${target}, ${source})
              }
            } catch (e) {
              // Silently ignore prototype setting errors in graceful-fs
              console.warn('[graceful-fs-compat] Skipped prototype setting to avoid cyclic reference:', e.message)
            }
          })()`
        })

        // Pattern 2: Fix __proto__ assignments that can cause cycles
        const protoAssignPattern = /(\w+)\.__proto__\s*=\s*([^;\n]+)/g
        transformedCode = transformedCode.replace(protoAssignPattern, (match, target, source) => {
          return `(function() {
            try {
              if (${target} && ${source} && ${target} !== ${source}) {
                // Safe __proto__ assignment with cycle detection
                let current = ${source}
                while (current) {
                  if (current === ${target}) {
                    return // Cycle detected
                  }
                  current = current.__proto__
                  if (!current || current === Object.prototype) {
                    break
                  }
                }
                ${target}.__proto__ = ${source}
              }
            } catch (e) {
              console.warn('[graceful-fs-compat] Skipped __proto__ assignment:', e.message)
            }
          })()`
        })

        // Pattern 3: Fix specific graceful-fs patterns that are known to cause issues
        // This targets the specific pattern: process.chdir = chdir$1; Object.setPrototypeOf(process.chdir, chdir$1)
        const gracefulFsSpecificPattern = /(\w+)\.(\w+)\s*=\s*(\w+);\s*Object\.setPrototypeOf\s*\(\s*\1\.\2\s*,\s*\3\s*\)/g
        transformedCode = transformedCode.replace(gracefulFsSpecificPattern, (match, obj, prop, value) => {
          return `${obj}.${prop} = ${value}; 
          // Skip problematic setPrototypeOf for graceful-fs compatibility
          try {
            if (${obj}.${prop} !== ${value}) {
              Object.setPrototypeOf(${obj}.${prop}, ${value})
            }
          } catch (e) {
            // Graceful-fs compatibility: ignore prototype setting errors
          }`
        })

        // Only return transformed code if changes were made
        if (transformedCode !== code) {
          return {
            code: transformedCode,
            map: null, // We could generate a source map here if needed
          }
        }

        return null
      },
    },
  }
}
