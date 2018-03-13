import * as ts from 'typescript'
import * as vm from 'vm'
import {
  applyTypesToFile,
  getTypeCollectorSnippet,
  IApplyTypesOptions,
  ICollectedTypeInfo,
  instrument
} from 'typewiz'

export function applyTypes(
  input: string,
  filePath: string,
  options: IApplyTypesOptions = {}
): string | undefined {
  // Step 1: instrument the source
  const instrumented = instrument(input, filePath)

  // Step 2: compile + add the type collector
  const compiled = ts.transpile(instrumented)

  // Step 3: evaluate the code, and collect the runtime type information
  const ctx = {}
  vm.createContext(ctx)
  const collectedTypes: ICollectedTypeInfo = vm.runInContext(
    getTypeCollectorSnippet() + compiled + ';$_$twiz.get();',
    ctx
  )

  // Step 4: put the collected typed into the code
  const sourceTypeInfo = collectedTypes.filter(info => {
    return info[0] === filePath
  })

  if (sourceTypeInfo.length === 0) {
    return undefined
  }

  return applyTypesToFile(input, sourceTypeInfo, options)
}
