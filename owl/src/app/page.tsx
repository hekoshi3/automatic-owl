"use client"

import Image from "next/image";
import React, { useState } from "react";

interface GenerationResponse {
  images: string[];
  parameters: Record<string, any>;
  info: string;
}

export default function GeneratePage() {
  const [upprompt, setUpPrompt] = useState('');
  const [downprompt, setDownPrompt] = useState('');
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [genSteps, setGenSteps] = useState<number>(0);
  const [genCfg, setGenCfg] = useState<number>(0.0);
  const [error, setError] = useState('');
  const [MainImagePath, setMainImagePath] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const genHost = "http://localhost:7860";

  async function sendGeneratePost(prompt: string, nprompt: string, inp_width: number, inp_height: number, steps: number, cfg_scale: number) {
    return new Promise<GenerationResponse>(async (base) => {
      if ((prompt == "") || (undefined) || (!prompt)) {
        prompt = "1girl,fu xuan \(honkai: star rail\),(ame929:0.56),(anna \(drw01\):0.4),(mignon:0.8),(amashiro natsuki:0.8),(dokuro deluxe:0.5),(ningen mame:0.6),(hiten \(hitenkei\):0.6),(atdan:0.5),<lora:USNR STYLE_XL_loha:0.4>,<lora:GENESIS_MK0.2:0.6>,<lora:rafaelaaa:0.3>,<lora:745cmSDXLvpred75S:0.4>,front view,side view,looking at viewer,hoodie,(((absurdres,masterpiece,best quality))),amazing quality,very aesthetic,high definition,"; //"1girl,nachoneko,<lora:745cmSDXLvpred75S:0.8>,<lora:Nyaliaversion5:0.8>,(ame929:0.8),(anna \(drw01\):0.8),(mignon:0.8),(amashiro natsuki:0.7),(dokuro deluxe:0.7),(ningen mame:0.7),(hiten \(hitenkei\):0.7),(atdan:0.7),looking at viewer,bedroom,sitting,on bed,cowboy shot,upper body,hoodie,hugging own legs,very awa,masterpiece,best quality,year 2024,newest,highres,absurdres,best quality,amazing quality,very aesthetic,absurdres,"
      }
      if ((nprompt == "") || (undefined) || (!nprompt)) {
        nprompt = "(low quality, worst quality:1.2),(bad anatomy:1.1),(inaccurate limb:1.1),bad composition,inaccurate eyes,extra digit,fewer digits,extra arms,(high contrast:1.2), ((nsfw)),"
      }
      const req = JSON.stringify(
        {
          "prompt": prompt,
          "negative_prompt": nprompt,
          "seed": -1,
          "sampler_name": "Euler a",
          "scheduler": "Automatic",
          "steps": steps,
          "cfg_scale": cfg_scale,
          "width": inp_width,
          "height": inp_height
        });
      try {
        const response = await fetch(genHost + '/sdapi/v1/txt2img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: req,
        });

        const gen_response = await response.json();
        base(gen_response);
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    })
  }

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);

    const gen_response = await sendGeneratePost(
      upprompt,
      downprompt,
      imgWidth || 832,
      imgHeight || 1216,
      genSteps || 20,
      genCfg || 4.0
    );

    const base64_image = gen_response.images[0];

    const response = await fetch('/api/save-on-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_image: base64_image,
        parameters: gen_response.info,
      }),
    });

    if (gen_response.parameters.width) {
      setImgWidth(gen_response.parameters.width)
    }
    if (gen_response.parameters.height) {
      setImgHeight(gen_response.parameters.height)
    }

    const image_path = await response.json();
    if (image_path.path) {
      setMainImagePath(image_path.path);
    } else {
      console.log(image_path);
    }
    setIsGenerating(false);
  };

  return (
    <>
      <div className="main-container">
        <div className="column left-column">
          <form onSubmit={generate}>
            <input
              type="text"
              id="up-p"
              name="up-prompt"
              className="text_input prompt"
              placeholder="Prompt"
              onChange={(e) => setUpPrompt(e.target.value)}
            />
            <input
              type="text"
              id="down-p"
              name="down-prompt"
              className="text_input prompt"
              placeholder="Negative Prompt"
              onChange={(e) => setDownPrompt(e.target.value)}
            />
            <div className="resolution_box">
              <input
                type="number"
                id="width_input"
                name="width_input"
                className="text_input resolution"
                placeholder="Width"
                defaultValue={832}
                onChange={(e) => setImgWidth(parseInt(e.target.value))}
              />
              <input
                type="number"
                id="height_input"
                name="height_input"
                className="text_input resolution"
                placeholder="Height"
                defaultValue={1216}
                onChange={(e) => setImgHeight(parseInt(e.target.value))}
              />
            </div>
            <input
              type="number"
              id="steps_input"
              name="steps_input"
              className="text_input"
              placeholder="Steps"
              defaultValue={20}
              onChange={(e) => setGenSteps(parseInt(e.target.value))}
            />
            <input
              type="number"
              id="cfg_input"
              name="cfg_input"
              className="text_input"
              placeholder="CGF Scale"
              defaultValue={4.5}
              min={0}
              max={10}
              step="any"
              onChange={(e) => setGenCfg(parseInt(e.target.value))}
            />
            <button type="submit" className="btn" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="column center-column">
          {MainImagePath && (
            <Image
              src={MainImagePath}
              alt="Generated"
              width={imgWidth}
              height={imgHeight}
              style={{ maxWidth: "90%", height: "auto" }}
              unoptimized
            />
          )}
        </div>
        <div className="column right-column">
        </div>
      </div>
    </>
  );
}