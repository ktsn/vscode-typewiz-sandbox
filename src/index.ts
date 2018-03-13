import debug = require('debug')
import * as vscode from 'vscode'
import { applyTypes } from './typewiz-wrapper'

const info = debug('typewiz:info')
info.log = console.log.bind(console)

export function activate(context: vscode.ExtensionContext): void {
  info('Activate')

  const disposable = vscode.workspace.onWillSaveTextDocument(event => {
    const doc = event.document
    const source = doc.getText()
    const filePath = doc.fileName

    info('WillSaveTextDocument %s', filePath)

    const applied = applyTypes(source, filePath)
    if (!applied) {
      return
    }

    const range = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(source.length)
    )
    const edit = vscode.TextEdit.replace(range, applied)

    event.waitUntil(Promise.resolve([edit]))
  })

  context.subscriptions.push(disposable)
}
