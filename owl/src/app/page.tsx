"use client"

import Image from "next/image";
import React, { useState } from "react";

export default function GeneratePage() {
  const [upprompt, setUpPrompt] = useState('');
  const [downprompt, setDownPrompt] = useState('');
  const [error, setError] = useState('');
  const [MainImagePath, setMainImagePath] = useState('');

  const genHost = "http://localhost:7860";

  async function sendGeneratePost(prompt: string, nprompt: string) {
    return new Promise(async (base) => {
      if ((prompt == "") || (undefined)) {
        prompt = "1girl,nachoneko,<lora:745cmSDXLvpred75S:0.8>,<lora:Nyaliaversion5:0.8>,(ame929:0.8),(anna \(drw01\):0.8),(mignon:0.8),(amashiro natsuki:0.7),(dokuro deluxe:0.7),(ningen mame:0.7),(hiten \(hitenkei\):0.7),(atdan:0.7),looking at viewer,bedroom,sitting,on bed,cowboy shot,upper body,hoodie,hugging own legs,very awa,masterpiece,best quality,year 2024,newest,highres,absurdres,best quality,amazing quality,very aesthetic,absurdres,"
      }
      if ((nprompt == "") || (undefined)) {
        nprompt = "(low quality, worst quality:1.2),(bad anatomy:1.1),(inaccurate limb:1.1),bad composition,inaccurate eyes,extra digit,fewer digits,extra arms,(high contrast:1.2), ((nsfw)),"
      }
      const req = JSON.stringify(
        {
          "prompt": prompt,
          "negative_prompt": nprompt,
          "seed": -1,
          "sampler_name": "Euler a",
          "scheduler": "Automatic",
          "steps": 12,
          "cfg_scale": 4.5,
          "width": 1024,
          "height": 1024
        });
      try {
        const response = await fetch(genHost + '/sdapi/v1/txt2img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: req,
        });
        const gen_response = response.json();

        base(gen_response);
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    })
  }

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();

    const gen_response = await sendGeneratePost(upprompt, downprompt);
    const parsed_response = JSON.parse(JSON.stringify(gen_response));
    const base64_image = parsed_response.images[0];
    const info_response = parsed_response.info;
    const response = await fetch('/api/save-on-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_image: base64_image,
        parameters: JSON.stringify(info_response),
      }),
    });
    const image_path = await response.json()
    console.log(image_path)
    if (image_path.path) (
      setMainImagePath(image_path.path)
    )
    else console.log(image_path)
  }

  return (
    <>
      <div className="mainWindow"></div>
      <div id="inputWindow">
        <form onSubmit={generate}>
          <div className="text_area">
            <input
              type="text"
              id="up-p"
              name="up-prompt"
              className="text_input"
              placeholder="prompt"
              onChange={(e) => setUpPrompt(e.target.value)}
            />
          </div>
          <div className="text_area">
            <input
              type="text"
              id="down-p"
              name="down-prompt"
              className="text_input"
              placeholder="negative prompt"
              onChange={(e) => setDownPrompt(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            <p>generate</p>
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
      <div>
        {MainImagePath && (
          <Image
            src={MainImagePath}
            alt="Generated"
            width={300}
            height={300}
            unoptimized
          />
        )}
      </div>
    </>
  );
}

