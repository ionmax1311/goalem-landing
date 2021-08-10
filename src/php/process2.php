<?php

/*
 * Форма обратной связи (https://itchief.ru/lessons/php/feedback-form-for-website)
 * Copyright 2016-2018 Alexander Maltsev
 * Licensed under MIT (https://github.com/itchief/feedback-form/blob/master/LICENSE)
 */

header('Content-Type: application/json');
// обработка только ajax запросов (при других запросах завершаем выполнение скрипта)
if (empty($_SERVER['HTTP_X_REQUESTED_WITH']) || $_SERVER['HTTP_X_REQUESTED_WITH'] != 'XMLHttpRequest') {
  exit();
}
// обработка данных, посланных только методом POST (при остальных методах завершаем выполнение скрипта)
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  exit();
}
/* 1 ЭТАП - НАСТРОЙКА ПЕРЕМЕННЫХ */
const
  IS_CHECK_CAPTCHA = false, // проверять капчу
  IS_SEND_MAIL = true, // отправлять письмо получателю
  IS_SEND_MAIL_SENDER = false, // отправлять информационное письмо отправителю
  IS_WRITE_LOG = false, // записывать данные в лог
  IS_SEND_FILES_IN_BODY = true, // добавить ссылки на файлы в тело письма
  IS_SENS_FILES_AS_ATTACHMENTS = true, // необходимо ли прикреплять файлы к письму
  MAX_FILE_SIZE = 5000000, // максимальный размер файла (в байтах)
  ALLOWED_EXTENSIONS = array('pdf', 'doc'), // разрешённые расширения файлов
  MAIL_FROM = 'no-reply@mydomain.ru', // от какого email будет отправляться письмо
  MAIL_FROM_NAME = 'Имя_сайта', // от какого имени будет отправляться письмо
  MAIL_SUBJECT = 'Сообщение с формы обратной связи', // тема письма
  MAIL_ADDRESS = 'ironman@odarq.com', // кому необходимо отправить письмо


  MAIL_SUBJECT_CLIENT = 'Ваше сообщение доставлено'; // настройки mail для информирования пользователя о доставке сообщения
$uploadPath = dirname(dirname(__FILE__)) . '/uploads/'; // директория для хранения загруженных файлов

// 2 ЭТАП - ПОДКЛЮЧЕНИЕ PHPMAILER
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once('../phpmailer/src/Exception.php');
require_once('../phpmailer/src/PHPMailer.php');
require_once('../phpmailer/src/SMTP.php');
// 3 ЭТАП - ОТКРЫТИЕ СЕССИИ И ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННОЙ ДЛЯ ХРАНЕНИЯ РЕЗУЛЬТАТОВ ОБРАБОТКИ ФОРМЫ
session_start();
$data['result'] = 'success';
/* 4 ЭТАП - ВАЛИДАЦИЯ ДАННЫХ (ЗНАЧЕНИЙ ПОЛЕЙ ФОРМЫ) */
// проверка поля name
if (isset($_POST['name'])) {
  $name = $_POST['name'];
}

// проверка поля email
if (isset($_POST['email'])) {
  $email = $_POST['email'];
}

if (isset($_POST['phone'])) {
  $phone = $_POST['phone'];
}


// 6 ЭТАП - ВАЛИДАЦИЯ ФАЙЛОВ
if (isset($_FILES['attachment'])) {
  // перебор массива $_FILES['attachment']
  foreach ($_FILES['attachment']['error'] as $key => $error) {
    // если файл был успешно загружен на сервер (ошибок не возникло), то...
    if ($error == UPLOAD_ERR_OK) {
      // получаем имя файла
      $fileName = $_FILES['attachment']['name'][$key];
      // получаем расширение файла в нижнем регистре
      $fileExtension = mb_strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
      // получаем размер файла
      $fileSize = $_FILES['attachment']['size'][$key];
      // результат проверки расширения файла
      $resultCheckExtension = true;
      // проверяем расширение загруженного файла
      if (!in_array($fileExtension, ALLOWED_EXTENSIONS)) {
        $resultCheckExtension = false;
        $data['attachment'][$key] = 'Файл имеет не разрешённый тип.';
        $data['result'] = 'error';
      }
      // проверяем размер файла
      if ($resultCheckExtension && ($fileSize > MAX_FILE_SIZE)) {
        $data['attachment'][$key] = 'Размер файла превышает допустимый.';
        $data['result'] = 'error';
      }
    } else {
      $data['attachment'][$key] = 'Ошибка при загрузке файла.';
      $data['result'] = 'error';
    }
  }
  // если ошибок валидации не возникло, то...
  if ($data['result'] == 'success') {
    // переменная для хранения имён файлов
    $attachments = array();
    // перемещение файлов в директорию $uploadPath
    foreach ($_FILES['attachment']['name'] as $key => $attachment) {
      // получаем имя файла
      $fileName = basename($_FILES['attachment']['name'][$key]);
      // получаем расширение файла в нижнем регистре
      $fileExtension = mb_strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
      // временное имя файла на сервере
      $fileTmp = $_FILES['attachment']['tmp_name'][$key];
      // создаём уникальное имя
      $fileNewName = uniqid('upload_', true) . '.' . $fileExtension;
      // перемещаем файл в директорию
      if (!move_uploaded_file($fileTmp, $uploadPath . $fileNewName)) {
        // ошибка при перемещении файла
        $data['attachment'][$key] = 'Ошибка при загрузке файла.';
        $data['result'] = 'error';
      } else {
        $attachments[] = $uploadPath . $fileNewName;
      }
    }
  }
}

/* 6 ЭТАП - ОТПРАВКА ПИСЬМА ПОЛУЧАТЕЛЮ */
if ($data['result'] == 'success' && IS_SEND_MAIL == true) {
  // получаем содержимое email шаблона
  $bodyMail = file_get_contents('email.tpl');
  // выполняем замену плейсхолдеров реальными значениями
  $bodyMail = str_replace('%email.title%', MAIL_SUBJECT, $bodyMail);
  $bodyMail = str_replace('%email.nameuser%', isset($name) ? $name : '-', $bodyMail);
  $bodyMail = str_replace('%email.phone%', isset($phone) ? $phone : '-', $bodyMail);
  $bodyMail = str_replace('%email.message%', isset($message) ? $message : '-', $bodyMail);
  $bodyMail = str_replace('%email.emailuser%', isset($email) ? $email : '-', $bodyMail);
  $bodyMail = str_replace('%email.date%', date('d.m.Y H:i'), $bodyMail);
  // добавление файлов в виде ссылок
  if (IS_SEND_FILES_IN_BODY) {
    if (isset($attachments)) {
      $listFiles = '<ul>';
      foreach ($attachments as $attachment) {
        $fileHref = substr($attachment, strpos($attachment, 'feedback/uploads/'));
        $fileName = basename($fileHref);
        $listFiles .= '<li><a href="' . $startPath . $fileHref . '">' . $fileName . '</a></li>';
      }
      $listFiles .= '</ul>';
      $bodyMail = str_replace('%email.attachments%', $listFiles, $bodyMail);
    } else {
      $bodyMail = str_replace('%email.attachments%', '-', $bodyMail);
    }
  }
  // устанавливаем параметры
  $mail = new PHPMailer;
  $mail->CharSet = 'UTF-8';
  $mail->IsHTML(true);
  $fromName = '=?UTF-8?B?' . base64_encode(MAIL_FROM_NAME) . '?=';
  $mail->setFrom(MAIL_FROM, $fromName);
  $mail->Subject = '=?UTF-8?B?' . base64_encode(MAIL_SUBJECT) . '?=';
  $mail->Body = $bodyMail;
  $mail->addAddress(MAIL_ADDRESS);
  // прикрепление файлов к письму
  if (IS_SENS_FILES_AS_ATTACHMENTS) {
    if (isset($attachments)) {
      foreach ($attachments as $attachment) {
        $mail->addAttachment($attachment);
      }
    }
  }
  // отправляем письмо
  if (!$mail->send()) {
    $data['result'] = 'error';
  }
}
/* 7 ЭТАП - ОТПРАВКА ИНФОРМАЦИОННОГО ПИСЬМА ОТПРАВИТЕЛЮ */
// if ($data['result'] == 'success' && IS_SEND_MAIL_SENDER == true) {
//   try {
//     // очистка всех адресов и прикреплёных файлов
//     $mail->clearAllRecipients();
//     $mail->clearAttachments();
//     // получаем содержимое email шаблона
//     $bodyMail = file_get_contents('email_client.tpl');
//     // выполняем замену плейсхолдеров реальными значениями
//     $bodyMail = str_replace('%email.title%', MAIL_SUBJECT, $bodyMail);
//     $bodyMail = str_replace('%email.nameuser%', isset($name) ? $name : '-', $bodyMail);
//     $bodyMail = str_replace('%email.date%', date('d.m.Y H:i'), $bodyMail);
//     // устанавливаем параметры
//     $mail->Subject = MAIL_SUBJECT_CLIENT;
//     $mail->Body = $bodyMail;
//     $mail->addAddress($email);
//     // отправляем письмо
//     $mail->send();
//   } catch (Exception $e) {
//   }
// }

/* ФИНАЛЬНЫЙ ЭТАП - ВОЗВРАЩАЕМ РЕЗУЛЬТАТЫ РАБОТЫ */
echo json_encode($data);
