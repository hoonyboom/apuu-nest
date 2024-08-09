export const MAIL_TEMPLATE = (verifyCode: number) => `
  <div style="display: flex; flex-direction: column; align-items: center; background-color:#2f4c8d; padding: 3rem;">
    <div style="display: flex; flex-direction: column; width: 100%; background-color: white; align-items: center; padding: 0 2rem;">
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; padding: 2rem; pointer-events: none;">
        <img
          src="https://apuu.us/assets/svgs/logo.svg"
          alt="apuu logo"
          style="width: 3rem; height: 3rem;"
        />
      </div>
      <h3 style="margin: 0px;">인증 코드</h3>
      <h1>${verifyCode}</h1>
      <p style="font-size: 12px; padding: 0.5rem 0 1rem;">(이 코드는 전송 2분 후에 만료됩니다.)</p>
      <div style="border: 0.5px lightgray solid; width: 100%;" />
      <p style="padding: 1rem; font-size: 13px;">Apuu는 사용자의 암호, 신용카드 또는 은행 계좌 번호를 묻거나 또는 확인하라는 이메일을 보내지 않습니다. 계정 정보를 업데이트하라는 링크가 포함된 의심스러운 이메일을 수신할 경우 링크를 클릭하지 말고 해당 이메일을 <u>apuu.official@gmail.com</u>에 제보하여 조사를 요청해주세요.</p>
    </div>
  </div>
`;
