export const MAIL_TEMPLATE = (verifyCode: number) => `
  <table style="width: 100%; background-color:#2f4c8d; padding: 3rem;" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table style="width: 100%; max-width: 600px; line-height: 1.5; background-color: white; padding: 0 2rem;" role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-top: 2rem; padding-bottom: 1.5rem;">
              <img
                src="cid:logo@apuu"
                alt="apuu logo"
                style="width: 3rem; height: 3rem;"
              />
            </td>
          </tr>
          <tr>
            <td align="center">
              <h3 style="margin: 0px;">인증코드</h3>
            </td>
          </tr>
          <tr>
            <td align="center">
              <h1 style="margin: 0px;">${verifyCode}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 1rem;">
              <p style="font-size: 12px; margin: 0px;">(이 코드는 전송 2분 후에 만료됩니다.)</p>
            </td>
          </tr>
          <tr>
            <td>
              <div style="border: 0.5px lightgray solid; width: 100%;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 1rem;">
              <p style="font-size: 13px;">
                Apuu는 사용자의 암호, 신용카드 또는 은행 계좌 번호를 묻거나 또는 확인하라는 이메일을 보내지 않습니다. 계정 정보를 업데이트하라는 링크가 포함된 의심스러운 이메일을 수신할 경우 링크를 클릭하지 말고 해당 이메일을 <u>apuu.official@gmail.com</u>에 제보하여 조사를 요청해주세요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;
