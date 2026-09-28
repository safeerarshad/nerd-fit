function Assert-SigningPair {
  param([bool]$KeyExists, [bool]$PasswordExists, [bool]$PublishedIdentityExists)
  if ($KeyExists -ne $PasswordExists) {
    throw 'Signing credential pair incomplete. Recover the original key and password together; do not regenerate either file.'
  }
  if (!$KeyExists -and $PublishedIdentityExists) {
    throw 'Signing credential identity was already recorded. Recover the original credentials; creating a replacement would break updates.'
  }
  return !$KeyExists
}
