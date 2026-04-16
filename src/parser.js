function firstMatch(str, regex, index = 1) {
  const match = str.match(regex);
  return match ? match[index] ?? null : null;
}

export function parseIm20(bytes) {
  const str = bytes
    .map((byte) => String.fromCharCode(byte))
    .join("")
    .replace(/^[\x02\x03\x04]+|[\x02\x03\x04]+$/g, "");

  const response = str.slice(0, 4);
  const cardNo = firstMatch(str, /\d{6}X{6}\d{4}/, 0);
  const expiry = "xxxx";
  const statusCode = firstMatch(str, /xxxx([A-Z0-9]{2})/);
  const approvalCode = firstMatch(str, /xxxx\d{2}(\d{6})/);
  const retrievalRefNo = firstMatch(str, /(\d{12})/);
  const traceNo = firstMatch(str, /(\d{6})(?=\d{8}00000)/);
  const undefined1 = firstMatch(str, /(\d{8})(?=\d{8}00000)/);
  const terminalId = firstMatch(str, /(\d{8})00000/);
  const merchantId = firstMatch(str, /00000(\d{15})/);
  const emvAppId = firstMatch(str, /(A000000\d{6,})/);

  let cardholderName = null;
  if (emvAppId) {
    const pos = str.indexOf(emvAppId);
    if (pos !== -1) {
      const afterAid = str.slice(pos + emvAppId.length);
      const nameMatch = afterAid.match(/\s{2,}([A-Z ]{10,})\s+\d{2}/);
      if (nameMatch) {
        cardholderName = nameMatch[1].trim();
      }
    }
  }

  const crypto = firstMatch(str, /A000000\d{6,}([0-9A-F]{16})/);
  const tailMatch = str.match(/\s(\d{2})([A-Za-z ]+)\s*$/);
  const cardType = tailMatch ? tailMatch[1] : null;
  const cardName = tailMatch && tailMatch[2].trim() ? tailMatch[2].trim() : null;

  return {
    str,
    response,
    "card no": cardNo,
    expiry,
    "status code": statusCode,
    "approval code": approvalCode,
    retrieval_ref_no: retrievalRefNo,
    trace_no: traceNo,
    undefined_1: undefined1,
    terminal_id: terminalId,
    merchant_id: merchantId,
    emv_app_id: emvAppId,
    crypto,
    cardholder_name: cardholderName,
    card_type: cardType,
    card_name: cardName
  };
}

export function validateBytes(bytes) {
  if (!Array.isArray(bytes)) {
    throw new Error("Input must be an array of numbers.");
  }

  for (const value of bytes) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error("Each array value must be an integer between 0 and 255.");
    }
  }

  return bytes;
}
