// Este arquivo é baseado no Create React App para registrar o service worker

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] é o endereço IPv6 localhost.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 são considerados localhost para IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    // O construtor de URL está disponível em todos os navegadores que suportam SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Nosso service worker não funcionará se PUBLIC_URL estiver em um
      // origem diferente do que nossa página está servindo.
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Isso está rodando em localhost. Vamos verificar se um service worker ainda existe ou não.
        checkValidServiceWorker(swUrl, config);

        // Adicione alguns logs adicionais para localhost, apontando para os desenvolvedores
        // para o service worker/PWA documentação.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Este aplicativo web está sendo servido em cache-first por um service worker. ' +
              'Para saber mais, visite https://cra.link/PWA'
          );
        });
      } else {
        // Não é localhost. Basta registrar o service worker.
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Neste ponto, o conteúdo pré-cacheado foi atualizado,
              // mas o service worker anterior ainda servirá o conteúdo mais antigo até que todas as guias do cliente sejam fechadas.
              console.log(
                'Novo conteúdo está disponível e será usado quando todas as ' +
                  'abas abertas neste aplicativo forem fechadas.'
              );

              // Execute a função de retorno de chamada
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Neste ponto, tudo foi pré-cacheado.
              // É o momento perfeito para exibir um
              // "O conteúdo está em cache para uso offline." mensagem.
              console.log('O conteúdo está em cache para uso offline.');

              // Execute a função de retorno de chamada
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Erro durante o registro do service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Verifique se o service worker pode ser encontrado. Se não puder recarregar a página.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Certifique-se de que o service worker existe e que realmente estamos recebendo um arquivo JavaScript.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Nenhum service worker encontrado. Provavelmente um aplicativo diferente. Recarregue a página.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker encontrado. Prossiga normalmente.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'Nenhuma conexão com a Internet encontrada. O aplicativo está sendo executado no modo offline.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
