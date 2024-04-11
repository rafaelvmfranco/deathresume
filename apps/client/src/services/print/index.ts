export const downloadPdf = async (url: string, id: string) => {
  fetch(url).then((response) => {
    response
      .blob()
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);

        let alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = `death-resume-${id}.pdf`;
        alink.click();
      })
      .catch((error) => {
        console.log("error", error);
      });
  });
};

export const openInNewTab = (url: string) => {
  const win = window.open(url, "_blank");
  if (win) win.focus();
};
